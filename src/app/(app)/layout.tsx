import { redirect } from "next/navigation";

import { AppShell } from "@/features/shell/components/app-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const [quotaResult, driveResult] = await Promise.all([
    supabase.rpc("get_my_generation_quota"),
    supabase.rpc("get_my_drive_connection"),
  ]);
  const quotaRow = Array.isArray(quotaResult.data) ? quotaResult.data[0] : undefined;
  const driveRow = Array.isArray(driveResult.data) ? driveResult.data[0] : undefined;
  const name = typeof data.user.user_metadata.full_name === "string"
    ? data.user.user_metadata.full_name
    : "Fitly member";

  return (
    <AppShell
      displayName={name}
      email={data.user.email ?? ""}
      quota={{
        used: typeof quotaRow?.used_today === "number" ? quotaRow.used_today : 0,
        limit: typeof quotaRow?.daily_limit === "number" ? quotaRow.daily_limit : 3,
      }}
      isDriveConnected={driveRow?.status === "connected"}
    >
      {children}
    </AppShell>
  );
}
