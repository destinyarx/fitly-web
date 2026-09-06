import { AccountActions } from "@/features/settings/components/account-actions";
import { requireUser } from "@/lib/auth/require-user.server";
import { PageHeader } from "@/shared/components/page-header";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.rpc("get_my_drive_connection");
  const row = Array.isArray(data) ? data[0] : undefined;
  const connected = row?.status === "connected";
  return <><PageHeader eyebrow="Account controls" title="Settings" description="Manage your Google Drive connection, session, and private-data choices." /><div className="mx-auto max-w-[850px] space-y-5 px-5 py-8 sm:px-8 lg:px-12"><section className="rounded-[28px] bg-white p-6"><h2 className="font-display text-2xl font-extrabold">Google account</h2><p className="mt-2 text-sm text-text-secondary">{user.email}</p><div className={`mt-5 rounded-2xl p-4 text-sm ${connected ? "bg-mint/45" : "bg-coral/10"}`}><strong>Drive {connected ? "connected" : "needs attention"}</strong><p className="mt-1 text-xs leading-5">{connected ? `Private Fitly files are managed in ${row?.drive_email ?? user.email}.` : "Reconnect to upload sources, generate, or view Drive-hosted images."}</p></div><div className="mt-5"><AccountActions isDriveConnected={connected} /></div></section><section className="rounded-[28px] bg-white p-6"><h2 className="font-display text-2xl font-extrabold">Privacy & data</h2><p className="mt-2 text-sm leading-6 text-text-secondary">Web source images and generated looks live in your visible Google Drive. Supabase only stages private bytes during generation or short-term delivery recovery.</p><div className="mt-4 flex gap-4 text-sm font-bold"><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a></div></section></div></>;
}
