import { garmentMetadataSchema } from "@/features/sources/source.schema";
import {
  deleteDriveFile,
  getDriveAccess,
  uploadDriveImage,
} from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { normalizeImage } from "@/shared/utils/normalize-image.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const formData = await request.formData();
    const file = formData.get("image");
    const metadata = garmentMetadataSchema.safeParse({
      name: formData.get("name"),
      brand: formData.get("brand") || undefined,
      price: formData.get("price") || undefined,
      category: formData.get("category"),
    });
    if (!(file instanceof File) || !metadata.success) {
      return Response.json({ error: "invalid_garment" }, { status: 400 });
    }

    const image = await normalizeImage(file);
    const id = crypto.randomUUID();
    const { accessToken, credentials } = await getDriveAccess(user.id);
    const driveFileId = await uploadDriveImage({
      accessToken,
      bytes: image.bytes,
      contentType: image.contentType,
      name: `${metadata.data.name}.jpg`,
      parentId: credentials.garmentsFolderId,
      entityId: id,
      entityType: "garment",
    });
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("web_garments")
      .insert({
        id,
        user_id: user.id,
        name: metadata.data.name,
        brand: metadata.data.brand ?? null,
        price: metadata.data.price ?? null,
        category: metadata.data.category,
        source: "upload",
        drive_file_id: driveFileId,
        mime_type: image.contentType,
        byte_size: image.byteSize,
      })
      .select("id")
      .single();
    if (error || !data) {
      await deleteDriveFile(accessToken, driveFileId).catch(() => undefined);
      throw new Error("garment_store_failed");
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    return sourceErrorResponse(error);
  }
}

function sourceErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (["invalid_image", "image_too_large"].includes(error.message)) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error.message === "drive_reauthorization_required") {
      return Response.json({ error: error.message }, { status: 409 });
    }
  }
  return authenticationErrorResponse(error);
}
