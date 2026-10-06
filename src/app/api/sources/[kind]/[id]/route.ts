import { z } from "zod";

import { deleteDriveFile, getDriveAccess } from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const paramsSchema = z.object({
  kind: z.enum(["body-template", "garment"]),
  id: z.string().uuid(),
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const params = paramsSchema.parse(await context.params);
    const { user } = await requireUser();
    const admin = createAdminSupabaseClient();
    const table = params.kind === "body-template" ? "web_body_templates" : "web_garments";
    const { data, error } = await admin
      .from(table)
      .select("drive_file_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return Response.json({ error: "not_found" }, { status: 404 });
    const { data: bodyTemplate } = params.kind === "body-template"
      ? await admin
          .from("web_body_templates")
          .select("is_primary")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

    const { accessToken } = await getDriveAccess(user.id);
    await deleteDriveFile(accessToken, data.drive_file_id);
    const { error: deleteError } = await admin
      .from(table)
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);
    if (deleteError) throw new Error("source_delete_failed");
    if (bodyTemplate?.is_primary === true) {
      const { data: nextPrimary } = await admin
        .from("web_body_templates")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (nextPrimary) {
        await admin.from("web_body_templates").update({ is_primary: true }).eq("id", nextPrimary.id);
      }
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "drive_reauthorization_required") {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return authenticationErrorResponse(error);
  }
}
