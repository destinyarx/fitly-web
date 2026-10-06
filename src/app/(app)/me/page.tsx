import { getBodyTemplates } from "@/features/sources";
import { SourceDeleteButton } from "@/features/sources/components/source-delete-button";
import { requireUser } from "@/lib/auth/require-user.server";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const [templates, quotaResult] = await Promise.all([
    getBodyTemplates(),
    supabase.rpc("get_my_generation_quota"),
  ]);
  const quotaRow = Array.isArray(quotaResult.data) ? quotaResult.data[0] : undefined;
  const limit = typeof quotaRow?.daily_limit === "number" ? quotaRow.daily_limit : 3;
  const used = typeof quotaRow?.used_today === "number" ? quotaRow.used_today : 0;
  const displayName = typeof user.user_metadata.full_name === "string"
    ? user.user_metadata.full_name
    : "Fitly member";

  return (
    <>
      <PageHeader
        eyebrow="Your Fitly"
        title="Profile"
        description="One account across Fitly mobile and web, with separate private image libraries."
        actions={<AppLink href="/settings" secondary>Settings</AppLink>}
      />
      <div className="mx-auto grid max-w-[1050px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
        <section className="self-start rounded-[28px] bg-ink-deep p-7 text-surface">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-marigold font-display text-2xl font-extrabold text-ink">{displayName.charAt(0).toUpperCase()}</div>
          <h2 className="font-display mt-5 text-2xl font-extrabold">{displayName}</h2>
          <p className="mt-1 text-sm text-surface/55">{user.email}</p>
          <p className="mt-5 font-display text-3xl font-extrabold text-marigold">{Math.max(limit - used, 0)} <span className="text-sm text-surface/65">try-ons left today</span></p>
          <p className="mt-6 text-xs leading-5 text-surface/55">Your identity and daily quota are shared with mobile. Photos and generated looks are not.</p>
        </section>
        <section className="rounded-[28px] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold tracking-[.14em] text-violet uppercase">Body templates</p>
              <h2 className="font-display mt-1 text-2xl font-extrabold">Your reusable mirror</h2>
            </div>
            <span className="text-xs font-bold text-text-tertiary">{templates.length}/5</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {templates.map((template) => (
              <article key={template.id} className="overflow-hidden rounded-[20px] bg-surface">
                <div className="relative aspect-[4/5]"><PrivateImage kind="body-template" id={template.id} alt={template.name} /></div>
                <div className="p-3">
                  <p className="truncate text-xs font-bold">{template.name}</p>
                  <p className="mt-1 text-[10px] text-text-tertiary">{template.pose === "full" ? "Full body" : "Waist up"} · {template.usageCount} {template.usageCount === 1 ? "look" : "looks"}</p>
                  <SourceDeleteButton id={template.id} kind="body-template" name={template.name} affectedLookCount={template.usageCount} />
                </div>
              </article>
            ))}
            {templates.length < 5 ? <div className="flex min-h-40 items-center justify-center rounded-[20px] bg-surface p-3"><AppLink href="/me/add-template" secondary>Add template</AppLink></div> : null}
          </div>
        </section>
      </div>
    </>
  );
}
