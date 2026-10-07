import { redirect } from "next/navigation";

// Settings now live in the Profile tabs. Kept so the Drive reconnect return path (`next: "/settings"`) still resolves.
export default function SettingsPage() {
  redirect("/me?tab=account");
}
