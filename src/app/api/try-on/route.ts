import { z } from "zod";

import { downloadDriveFile, getDriveAccess } from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isPoseCompatible } from "@/shared/types/domain";

const requestSchema = z.object({
  bodyTemplateId: z.string().uuid(),
  garmentId: z.string().uuid(),
});

export async function POST(request: Request) {
  const staged: Array<{ bucket: string; path: string }> = [];
  try {
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    const { supabase, user } = await requireUser();
    const admin = createAdminSupabaseClient();
    const [{ data: body }, { data: garment }] = await Promise.all([
      admin.from("web_body_templates").select("id,user_id,pose,drive_file_id,availability_status,mime_type").eq("id", parsed.data.bodyTemplateId).eq("user_id", user.id).maybeSingle(),
      admin.from("web_garments").select("id,user_id,category,drive_file_id,availability_status,mime_type").eq("id", parsed.data.garmentId).eq("user_id", user.id).maybeSingle(),
    ]);
    if (!body || !garment) return Response.json({ error: "source_not_found" }, { status: 404 });
    if (body.availability_status !== "available" || garment.availability_status !== "available") return Response.json({ error: "source_missing" }, { status: 409 });
    if (!isPoseCompatible(body.pose, garment.category)) return Response.json({ error: "incompatible_template" }, { status: 422 });

    const { accessToken } = await getDriveAccess(user.id);
    const [bodyFile, garmentFile] = await Promise.all([
      downloadDriveFile(accessToken, body.drive_file_id),
      downloadDriveFile(accessToken, garment.drive_file_id),
    ]);
    const stagingAttemptId = crypto.randomUUID();
    const inputs = [
      { kind: "body_template", entityId: body.id, bucket: "body-photos", file: bodyFile },
      { kind: "garment", entityId: garment.id, bucket: "garments", file: garmentFile },
    ] as const;
    for (const input of inputs) {
      const path = `${user.id}/web/${stagingAttemptId}/${input.kind}.jpg`;
      const { error } = await admin.storage.from(input.bucket).upload(path, input.file.bytes, { contentType: input.file.contentType, upsert: false });
      if (error) throw new Error("staging_failed");
      staged.push({ bucket: input.bucket, path });
      const { error: rowError } = await admin.from("web_generation_inputs").insert({
        staging_attempt_id: stagingAttemptId,
        user_id: user.id,
        input_kind: input.kind,
        entity_id: input.entityId,
        bucket: input.bucket,
        object_path: path,
        mime_type: input.file.contentType,
        byte_size: input.file.bytes.byteLength,
      });
      if (rowError) throw new Error("staging_failed");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("authentication_required");
    const { data, error } = await supabase.functions.invoke("generate-tryon", {
      body: {
        clientPlatform: "web",
        stagingAttemptId,
        bodyTemplateId: body.id,
        garmentIds: [garment.id],
      },
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    const response = z.object({ resultId: z.string().uuid(), status: z.literal("queued") }).safeParse(data);
    if (error || !response.success) {
      const status = error?.context instanceof Response ? error.context.status : 502;
      await purgeStaging(admin, stagingAttemptId, staged);
      return Response.json({ error: "generation_rejected" }, { status });
    }
    return Response.json(response.data, { status: 202 });
  } catch (error) {
    const admin = createAdminSupabaseClient();
    await Promise.all(staged.map((item) => admin.storage.from(item.bucket).remove([item.path])));
    if (error instanceof Error && error.message === "drive_reauthorization_required") return Response.json({ error: error.message }, { status: 409 });
    return authenticationErrorResponse(error);
  }
}

async function purgeStaging(admin: ReturnType<typeof createAdminSupabaseClient>, stagingAttemptId: string, staged: readonly { bucket: string; path: string }[]) {
  await Promise.all(staged.map((item) => admin.storage.from(item.bucket).remove([item.path])));
  await admin.from("web_generation_inputs").delete().eq("staging_attempt_id", stagingAttemptId);
}
