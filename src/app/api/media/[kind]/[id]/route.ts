import { z } from "zod";

import { downloadDriveFile, getDriveAccess } from "@/features/drive/services/google-drive.server";
import { requireUser, authenticationErrorResponse } from "@/lib/auth/require-user.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const paramsSchema = z.object({
  kind: z.enum(["body-template", "garment", "look"]),
  id: z.string().uuid(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const params = paramsSchema.parse(await context.params);
    const { user } = await requireUser();
    const table = params.kind === "body-template"
      ? "web_body_templates"
      : params.kind === "garment"
        ? "web_garments"
        : "web_tryon_results";
    const admin = createAdminSupabaseClient();
    const columns = params.kind === "look"
      ? "drive_file_id,recovery_output_path"
      : "drive_file_id,mime_type";
    const { data, error } = await admin
      .from(table)
      .select(columns)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return Response.json({ error: "not_found" }, { status: 404 });

    if (typeof data.drive_file_id === "string") {
      const { accessToken } = await getDriveAccess(user.id);
      const file = await downloadDriveFile(accessToken, data.drive_file_id);
      return new Response(new Uint8Array(file.bytes), {
        headers: {
          "Content-Type": file.contentType,
          "Cache-Control": "private, no-store",
          "Content-Disposition": new URL(request.url).searchParams.has("download")
            ? `attachment; filename="fitly-${params.id}.jpg"`
            : "inline",
        },
      });
    }

    if (
      params.kind === "look" &&
      "recovery_output_path" in data &&
      typeof data.recovery_output_path === "string"
    ) {
      const { data: recovery, error: downloadError } = await admin.storage
        .from("tryon-results")
        .download(data.recovery_output_path);
      if (downloadError) return Response.json({ error: "not_found" }, { status: 404 });
      return new Response(recovery, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" } });
    }

    return Response.json({ error: "not_found" }, { status: 404 });
  } catch (error) {
    return authenticationErrorResponse(error);
  }
}
