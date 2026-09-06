import "server-only";

import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

import type { DriveCredentials, DriveFolders, DriveIdentity } from "../drive.types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const userInfoSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
});

const fileSchema = z.object({ id: z.string().min(1) });
const fileListSchema = z.object({ files: z.array(fileSchema).default([]) });
const tokenSchema = z.object({ access_token: z.string().min(1) });

export async function getGoogleIdentity(accessToken: string): Promise<DriveIdentity> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("drive_account_lookup_failed");
  const identity = userInfoSchema.parse(await response.json());
  return { subject: identity.sub, email: identity.email.toLowerCase() };
}

export async function ensureDriveFolders(
  accessToken: string,
  environment: string,
  existing?: Partial<DriveFolders>,
): Promise<DriveFolders> {
  const rootFolderId = await ensureFolder({
    accessToken,
    name: "Fitly",
    role: "root",
    environment,
    existingId: existing?.rootFolderId,
  });
  const [bodyTemplatesFolderId, garmentsFolderId, generatedLooksFolderId] =
    await Promise.all([
      ensureFolder({
        accessToken,
        name: "Body Templates",
        role: "body-templates",
        environment,
        parentId: rootFolderId,
        existingId: existing?.bodyTemplatesFolderId,
      }),
      ensureFolder({
        accessToken,
        name: "Garments",
        role: "garments",
        environment,
        parentId: rootFolderId,
        existingId: existing?.garmentsFolderId,
      }),
      ensureFolder({
        accessToken,
        name: "Generated Looks",
        role: "generated-looks",
        environment,
        parentId: rootFolderId,
        existingId: existing?.generatedLooksFolderId,
      }),
    ]);

  return { rootFolderId, bodyTemplatesFolderId, garmentsFolderId, generatedLooksFolderId };
}

export async function storeDriveConnection(args: {
  userId: string;
  identity: DriveIdentity;
  refreshToken: string;
  folders: DriveFolders;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.rpc("store_google_drive_connection", {
    p_user_id: args.userId,
    p_provider_subject: args.identity.subject,
    p_drive_email: args.identity.email,
    p_refresh_token: args.refreshToken,
    p_root_folder_id: args.folders.rootFolderId,
    p_body_templates_folder_id: args.folders.bodyTemplatesFolderId,
    p_garments_folder_id: args.folders.garmentsFolderId,
    p_generated_looks_folder_id: args.folders.generatedLooksFolderId,
  });
  if (error) throw new Error("drive_connection_store_failed");
}

export async function getDriveAccess(userId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.rpc("get_google_drive_credentials", {
    p_user_id: userId,
  });
  const row = Array.isArray(data) ? data[0] : null;
  const parsed = driveCredentialsSchema.safeParse(row);
  if (error || !parsed.success || parsed.data.status !== "connected") {
    throw new Error("drive_reauthorization_required");
  }

  try {
    const accessToken = await refreshGoogleAccessToken(parsed.data.refresh_token);
    return { accessToken, credentials: mapCredentials(parsed.data) };
  } catch {
    await admin
      .from("google_drive_connections")
      .update({ status: "reauthorization_required" })
      .eq("user_id", userId);
    throw new Error("drive_reauthorization_required");
  }
}

export async function uploadDriveImage(args: {
  accessToken: string;
  bytes: Buffer;
  contentType: "image/jpeg";
  name: string;
  parentId: string;
  entityId: string;
  entityType: "body-template" | "garment" | "look";
}) {
  const boundary = `fitly_${crypto.randomUUID().replaceAll("-", "")}`;
  const metadata = JSON.stringify({
    name: args.name,
    parents: [args.parentId],
    appProperties: {
      fitlyEntityId: args.entityId,
      fitlyEntityType: args.entityType,
      fitlyEnvironment: getServerEnv().fitlyEnvironment,
    },
  });
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${args.contentType}\r\n\r\n`,
    ),
    args.bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const response = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(mapDriveStatus(response.status));
  return fileSchema.parse(await response.json()).id;
}

export async function downloadDriveFile(accessToken: string, fileId: string) {
  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (!response.ok) throw new Error(mapDriveStatus(response.status));
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
  };
}

export async function deleteDriveFile(accessToken: string, fileId: string) {
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok && response.status !== 404) throw new Error(mapDriveStatus(response.status));
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const { googleOAuthClientId, googleOAuthClientSecret } = getServerEnv();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleOAuthClientId,
      client_secret: googleOAuthClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("drive_reauthorization_required");
  return tokenSchema.parse(await response.json()).access_token;
}

async function ensureFolder(args: {
  accessToken: string;
  name: string;
  role: string;
  environment: string;
  parentId?: string;
  existingId?: string;
}) {
  if (args.existingId && (await folderExists(args.accessToken, args.existingId))) {
    return args.existingId;
  }

  const clauses = [
    `mimeType = '${FOLDER_MIME_TYPE}'`,
    "trashed = false",
    `appProperties has { key='fitlyFolderRole' and value='${args.role}' }`,
    `appProperties has { key='fitlyEnvironment' and value='${args.environment}' }`,
  ];
  if (args.parentId) clauses.push(`'${args.parentId}' in parents`);
  const search = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(clauses.join(" and "))}&fields=files(id)&pageSize=1`,
    { headers: { Authorization: `Bearer ${args.accessToken}` }, cache: "no-store" },
  );
  if (!search.ok) throw new Error(mapDriveStatus(search.status));
  const existing = fileListSchema.parse(await search.json()).files[0];
  if (existing) return existing.id;

  const create = await fetch(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: args.name,
      mimeType: FOLDER_MIME_TYPE,
      parents: args.parentId ? [args.parentId] : undefined,
      appProperties: {
        fitlyFolderRole: args.role,
        fitlyEnvironment: args.environment,
      },
    }),
    cache: "no-store",
  });
  if (!create.ok) throw new Error(mapDriveStatus(create.status));
  return fileSchema.parse(await create.json()).id;
}

async function folderExists(accessToken: string, folderId: string) {
  const response = await fetch(
    `${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=id,trashed,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(mapDriveStatus(response.status));
  const payload = z
    .object({ trashed: z.boolean().default(false), mimeType: z.string() })
    .parse(await response.json());
  return !payload.trashed && payload.mimeType === FOLDER_MIME_TYPE;
}

const driveCredentialsSchema = z.object({
  provider_subject: z.string(),
  drive_email: z.email(),
  refresh_token: z.string(),
  root_folder_id: z.string(),
  body_templates_folder_id: z.string(),
  garments_folder_id: z.string(),
  generated_looks_folder_id: z.string(),
  status: z.enum(["connected", "reauthorization_required", "revoked"]),
});

function mapCredentials(row: z.infer<typeof driveCredentialsSchema>): DriveCredentials {
  return {
    subject: row.provider_subject,
    email: row.drive_email,
    refreshToken: row.refresh_token,
    rootFolderId: row.root_folder_id,
    bodyTemplatesFolderId: row.body_templates_folder_id,
    garmentsFolderId: row.garments_folder_id,
    generatedLooksFolderId: row.generated_looks_folder_id,
    status: row.status,
  };
}

function mapDriveStatus(status: number) {
  if (status === 401 || status === 403) return "drive_reauthorization_required";
  if (status === 404) return "source_missing";
  return "drive_request_failed";
}
