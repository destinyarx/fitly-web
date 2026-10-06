import { z } from "zod";

import { getDriveAccess, uploadDriveImage } from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = z.string().uuid().parse((await context.params).id);
    const { user } = await requireUser();
    const admin = createAdminSupabaseClient();
    const { data: result } = await admin
      .from("web_tryon_results")
      .select("id,recovery_output_path,recovery_expires_at,garment_snapshots")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("generation_status", "completed")
      .eq("delivery_status", "failed")
      .maybeSingle();
    if (
      !result?.recovery_output_path ||
      !result.recovery_expires_at ||
      new Date(result.recovery_expires_at) <= new Date()
    ) {
      return Response.json({ error: "recovery_expired" }, { status: 410 });
    }

    await admin
      .from("web_tryon_results")
      .update({ delivery_status: "delivering" })
      .eq("id", id)
      .eq("user_id", user.id);

    try {
      const { data: recovery, error } = await admin.storage
        .from("tryon-results")
        .download(result.recovery_output_path);
      if (error) throw new Error("recovery_missing");
      const bytes = Buffer.from(await recovery.arrayBuffer());
      const { accessToken, credentials } = await getDriveAccess(user.id);
      const garmentName = Array.isArray(result.garment_snapshots) &&
        typeof result.garment_snapshots[0]?.name === "string"
        ? result.garment_snapshots[0].name
        : "Fitly look";
      const driveFileId = await uploadDriveImage({
        accessToken,
        bytes,
        contentType: "image/jpeg",
        name: `${garmentName} - Fitly.jpg`,
        parentId: credentials.generatedLooksFolderId,
        entityId: id,
        entityType: "look",
      });
      const { error: updateError } = await admin
        .from("web_tryon_results")
        .update({
          delivery_status: "delivered",
          drive_file_id: driveFileId,
          recovery_output_path: null,
          recovery_expires_at: null,
          failure_code: null,
          failure_reason: null,
        })
        .eq("id", id)
        .eq("user_id", user.id);
      if (updateError) throw new Error("delivery_update_failed");
      await admin.storage.from("tryon-results").remove([result.recovery_output_path]);
      return Response.json({ status: "delivered" });
    } catch (deliveryError) {
      await admin
        .from("web_tryon_results")
        .update({ delivery_status: "failed" })
        .eq("id", id)
        .eq("user_id", user.id);
      if (
        deliveryError instanceof Error &&
        deliveryError.message === "drive_reauthorization_required"
      ) {
        return Response.json({ error: deliveryError.message }, { status: 409 });
      }
      if (
        deliveryError instanceof Error &&
        deliveryError.message === "recovery_missing"
      ) {
        return Response.json({ error: deliveryError.message }, { status: 410 });
      }
      return Response.json({ error: "delivery_retry_failed" }, { status: 502 });
    }
  } catch (error) {
    return authenticationErrorResponse(error);
  }
}
