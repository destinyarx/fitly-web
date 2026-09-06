import { z } from "zod";

import { deleteDriveFile, getDriveAccess } from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { user } = await requireUser();
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("web_tryon_results").select("id,generation_status,delivery_status,failure_code,failure_reason,recovery_expires_at").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error || !data) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authenticationErrorResponse(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = idSchema.parse((await context.params).id);
    const { user } = await requireUser();
    const admin = createAdminSupabaseClient();
    const { data } = await admin.from("web_tryon_results").select("drive_file_id,recovery_output_path").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!data) return Response.json({ error: "not_found" }, { status: 404 });
    if (data.drive_file_id) { const { accessToken } = await getDriveAccess(user.id); await deleteDriveFile(accessToken, data.drive_file_id); }
    if (data.recovery_output_path) await admin.storage.from("tryon-results").remove([data.recovery_output_path]);
    const { error } = await admin.from("web_tryon_results").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw new Error("delete_failed");
    return new Response(null, { status: 204 });
  } catch (error) { return authenticationErrorResponse(error); }
}
