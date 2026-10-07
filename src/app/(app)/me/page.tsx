import Link from "next/link";

import { AccountActions } from "@/features/settings/components/account-actions";
import { DeleteAccountPanel } from "@/features/settings/components/delete-account-panel";
import { getBodyTemplates } from "@/features/sources";
import type { BodyTemplate } from "@/features/sources";
import { SourceDeleteButton } from "@/features/sources/components/source-delete-button";
import { requireUser } from "@/lib/auth/require-user.server";
import { AppLink } from "@/shared/components/app-button";
import { CheckIcon, LockIcon } from "@/shared/components/icons";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";
import { SideRail } from "@/shared/components/side-rail";

const TABS = [
  { key: "account", label: "Account", icon: "M12 11.6a3.8 3.8 0 100-7.6 3.8 3.8 0 000 7.6zM4.6 20c1.5-3.3 4.2-4.9 7.4-4.9s5.9 1.6 7.4 4.9" },
  { key: "templates", label: "Body templates", icon: "M12 6.4a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM8 22l1.2-7.2L6.2 12V8.6h11.6V12l-3 2.8L16 22" },
  { key: "plan", label: "Plan & usage", icon: "M3.5 8.5h17v9.5a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5V8.5zM3.5 8.5V6.5A1.5 1.5 0 015 5h14a1.5 1.5 0 011.5 1.5v2M7 15h4" },
  { key: "privacy", label: "Privacy & data", icon: "M12 3.2l7 2.8v5.6c0 4.3-2.9 7.5-7 9.2-4.1-1.7-7-4.9-7-9.2V6l7-2.8z" },
] as const;
type ProfileTab = (typeof TABS)[number]["key"];

const TEMPLATE_LIMIT = 5;

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { supabase, user } = await requireUser();
  const requestedTab = (await searchParams).tab;
  const tab: ProfileTab = TABS.find((item) => item.key === requestedTab)?.key ?? "account";
  const [templates, quotaResult, driveResult] = await Promise.all([
    getBodyTemplates(),
    supabase.rpc("get_my_generation_quota"),
    supabase.rpc("get_my_drive_connection"),
  ]);
  const quotaRow = Array.isArray(quotaResult.data) ? quotaResult.data[0] : undefined;
  const limit = typeof quotaRow?.daily_limit === "number" ? quotaRow.daily_limit : 3;
  const used = typeof quotaRow?.used_today === "number" ? quotaRow.used_today : 0;
  const left = Math.max(limit - used, 0);
  const driveRow = Array.isArray(driveResult.data) ? driveResult.data[0] : undefined;
  const isDriveConnected = driveRow?.status === "connected";
  const driveEmail = typeof driveRow?.drive_email === "string" ? driveRow.drive_email : user.email ?? "";
  const displayName = typeof user.user_metadata.full_name === "string"
    ? user.user_metadata.full_name
    : "Fitly member";

  return (
    <>
      <PageHeader crumb="Profile" title="Profile" description="Account, body templates, plan and privacy. One account across Fitly mobile and web." />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[246px_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
          <div className="panel flex items-center gap-3 rounded-[22px] p-5">
            <span aria-hidden="true" className="font-display flex size-[46px] flex-none items-center justify-center rounded-full bg-linear-140 from-peach-soft to-lilac text-lg font-extrabold text-ink shadow-[0_0_0_2px_#FFF6EC,0_0_0_3.5px_#4A2AB8]">{displayName.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-[-0.02em] text-ink">{displayName}</p>
              <p className="text-[12.5px] font-semibold text-text-tertiary">Free plan · {left}/{limit} fits today</p>
            </div>
          </div>
          <SideRail label="Profile sections" items={TABS.map((item) => ({ href: `/me?tab=${item.key}`, label: item.label, icon: item.icon, isActive: tab === item.key }))} />
        </div>

        <div className="min-w-0">
          {tab === "account" ? <AccountTab displayName={displayName} email={user.email ?? ""} driveEmail={driveEmail} isDriveConnected={isDriveConnected} /> : null}
          {tab === "templates" ? <TemplatesTab templates={templates} /> : null}
          {tab === "plan" ? <PlanTab left={left} limit={limit} used={used} /> : null}
          {tab === "privacy" ? <PrivacyTab /> : null}
        </div>
      </div>
    </>
  );
}

function TabPanel({ children, title, description, action }: { readonly children?: React.ReactNode; readonly title: string; readonly description: string; readonly action?: React.ReactNode }) {
  return (
    <section className="panel rounded-[28px] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.035em] text-ink">{title}</h2>
          <p className="mt-[5px] max-w-[560px] text-sm leading-[1.5] text-text-secondary">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ReadOnlyField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-[12.5px] font-bold text-text-secondary">{label}</dt>
      <dd className="mt-[7px] truncate rounded-[14px] bg-white px-3.5 py-3 text-sm font-medium text-ink shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.1)]">{value}</dd>
    </div>
  );
}

function AccountTab({ displayName, driveEmail, email, isDriveConnected }: { readonly displayName: string; readonly email: string; readonly driveEmail: string; readonly isDriveConnected: boolean }) {
  return (
    <>
      <TabPanel title="Account" description="Your name and email come from the Google account you sign in with.">
        <dl className="mt-[22px] grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Display name" value={displayName} />
          <ReadOnlyField label="Email" value={email} />
          <ReadOnlyField label="Google Drive" value={driveEmail} />
          <ReadOnlyField label="Drive connection" value={isDriveConnected ? "Connected" : "Needs reconnect"} />
        </dl>
        <div className={`mt-5 rounded-[18px] p-4 text-sm ${isDriveConnected ? "bg-mint/45" : "bg-coral/10"}`}>
          <strong>Drive {isDriveConnected ? "connected" : "needs attention"}</strong>
          <p className="mt-1 text-xs leading-5">{isDriveConnected ? `Private Fitly files are managed in ${driveEmail}.` : "Reconnect to upload sources, generate, or view Drive-hosted images. You stay signed in."}</p>
        </div>
        <div className="mt-[22px]"><AccountActions isDriveConnected={isDriveConnected} /></div>
      </TabPanel>
      <section className="mt-4 flex flex-col gap-5 rounded-[28px] bg-lilac px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl leading-[1.15] font-bold tracking-[-0.035em] text-ink">Also on your phone</h2>
          <p className="mt-[5px] text-[13.5px] leading-[1.45] text-ink/66">The Android app adds in-store camera try-on. Same account and daily try-ons; its photos and looks stay on the phone.</p>
        </div>
        <Link href="/#mobile" className="inline-flex min-h-11 flex-none items-center gap-[9px] rounded-full bg-ink px-[22px] text-[13.5px] font-bold text-surface transition-transform hover:-translate-y-px">Get Android app</Link>
      </section>
    </>
  );
}

function TemplatesTab({ templates }: { readonly templates: readonly BodyTemplate[] }) {
  const canAdd = templates.length < TEMPLATE_LIMIT;
  return (
    <TabPanel
      title="Body templates"
      description={`Every try-on is generated from one of these. ${templates.length}/${TEMPLATE_LIMIT} web templates used. Deleting one keeps the looks you already made.`}
      action={canAdd ? <AppLink href="/me/add-template" variant="violet">Upload photo</AppLink> : null}
    >
      <ul className="mt-[22px] grid grid-cols-2 gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <li key={template.id} className={`overflow-hidden rounded-[22px] bg-white ${template.isPrimary ? "shadow-[0_0_0_2px_#FFE066]" : "shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.1)]"}`}>
            <div className="relative aspect-[4/5] bg-canvas">
              <PrivateImage kind="body-template" id={template.id} alt={template.name} />
              <span className="absolute top-2.5 left-2.5 rounded-full bg-ink/78 px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.08em] text-surface">{template.pose === "full" ? "FULL BODY" : "WAIST UP"}</span>
              {template.isPrimary ? <span className="absolute top-2.5 right-2.5 rounded-full bg-marigold px-[9px] py-1 font-mono text-[9.5px] font-extrabold text-ink">MAIN</span> : null}
              {template.availabilityStatus === "missing" ? <span className="absolute inset-x-2.5 bottom-2.5 rounded-full bg-coral-deep px-3 py-1.5 text-center text-[10px] font-bold text-white">Missing from Drive</span> : null}
            </div>
            <div className="flex items-center justify-between gap-2.5 py-2 pr-2 pl-[15px]">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">{template.name}</p>
                <p className="text-xs font-semibold text-text-secondary">Added {new Date(template.createdAt).toLocaleDateString()} · {template.usageCount} {template.usageCount === 1 ? "look" : "looks"}</p>
              </div>
              <SourceDeleteButton id={template.id} kind="body-template" name={template.name} affectedLookCount={template.usageCount} />
            </div>
          </li>
        ))}
        {canAdd ? (
          <li>
            <Link href="/me/add-template" className="flex aspect-[4/5] h-full flex-col items-center justify-center gap-[9px] rounded-[22px] bg-white text-center shadow-[inset_0_0_0_2px_rgba(74,42,184,.24)] hover:shadow-[inset_0_0_0_2px_#4A2AB8]">
              <span aria-hidden="true" className="font-mono text-xl font-extrabold text-violet">+</span>
              <span className="text-[12.5px] leading-[1.35] font-bold text-violet">Add a body template</span>
              <span className="text-[11.5px] font-medium text-text-tertiary">{TEMPLATE_LIMIT - templates.length} slots left</span>
            </Link>
          </li>
        ) : null}
      </ul>
    </TabPanel>
  );
}

function PlanTab({ left, limit, used }: { readonly left: number; readonly limit: number; readonly used: number }) {
  const includes = ["5 body templates on web", "3 try-ons a day, shared with mobile", "Unlimited saved looks in your Drive", "Upload any garment photo"];
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[1.1fr_1fr]">
      <section className="panel rounded-[28px] p-7">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.035em] text-ink">Free plan</h2>
          <span className="rounded-full bg-violet/12 px-[11px] py-[5px] font-mono text-[10px] font-extrabold tracking-[0.09em] text-violet">ACTIVE</span>
        </div>
        <p className="mt-[5px] text-sm text-text-secondary">No card on file. Nothing to cancel.</p>
        <div className="mt-[22px] rounded-[20px] bg-white p-[18px] shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.08)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-bold text-text-secondary">Try-ons today</span>
            <span className="text-[13px] font-bold text-ink">{left} of {limit} left</span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink/8" role="progressbar" aria-label="Try-ons left today" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={left}>
            <div className="h-full rounded-full bg-violet" style={{ width: `${limit ? (left / limit) * 100 : 0}%` }} />
          </div>
          <p className="mt-2.5 text-[12.5px] font-medium text-text-tertiary">{used} used across web and mobile · resets at 00:00 UTC.</p>
        </div>
        <ul className="mt-[18px] flex flex-col gap-[11px]">
          {includes.map((item) => <li key={item} className="flex items-center gap-2.5 text-sm text-[#5C5470]"><CheckIcon size={14} stroke="#4A2AB8" />{item}</li>)}
        </ul>
      </section>
      <section className="rounded-[28px] bg-ink p-7 opacity-94">
        <div className="flex items-center gap-[9px]">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.035em] text-surface">Fitly Plus</h2>
          <span className="flex items-center gap-[5px] rounded-full bg-surface/14 px-[11px] py-[5px] font-mono text-[10px] font-extrabold tracking-[0.09em] text-surface/72"><LockIcon fill="rgba(255,246,236,.72)" width={9} height={11} />SOON</span>
        </div>
        <p className="mt-1.5 text-sm leading-[1.5] text-surface/60">More try-ons, extra templates and outfit stacking are planned. Paid plans are not available yet.</p>
        <span aria-disabled="true" className="mt-5 flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface/6 text-[14.5px] font-bold text-surface/62 shadow-[inset_0_0_0_1.6px_rgba(255,246,236,.24)]"><LockIcon fill="rgba(255,246,236,.62)" />Coming soon</span>
        <p className="mt-2.5 text-center text-[12.5px] font-semibold text-surface/45">Free plan only during early access</p>
      </section>
    </div>
  );
}

function PrivacyTab() {
  return (
    <>
      <TabPanel title="Privacy & data" description="Web body templates, garments and generated looks are private files in your own Google Drive. Generation temporarily stages selected images in private Supabase Storage and sends them to the AI provider.">
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold"><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms</Link></div>
      </TabPanel>
      <section className="relative mt-4 overflow-hidden rounded-[28px] bg-ink p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -top-[110px] -right-[90px] size-[300px] rounded-full bg-[radial-gradient(circle_at_45%_55%,rgba(255,224,102,.28),rgba(255,224,102,0)_70%)]" />
        <div className="relative flex items-center gap-[13px]">
          <span aria-hidden="true" className="flex size-[42px] flex-none items-center justify-center rounded-[14px] bg-marigold shadow-[0_12px_26px_-12px_rgba(255,224,102,.9)]">
            <svg width="20" height="20" viewBox="0 0 22 22"><path d="M11 2.2l7 2.6v6.1c0 4.3-2.9 7.6-7 8.9-4.1-1.3-7-4.6-7-8.9V4.8l7-2.6z" fill="none" stroke="#1E1233" strokeWidth="1.8" strokeLinejoin="round" /><path d="M7.8 11.1l2.2 2.2 4.2-4.5" fill="none" stroke="#1E1233" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <p className="font-mono text-[10.5px] font-bold tracking-[0.11em] text-surface/50">YOUR DATA</p>
            <h2 className="mt-1 text-[15.5px] font-bold tracking-[-0.015em] text-surface">Yours to take, yours to erase</h2>
          </div>
        </div>
        <p className="relative mt-4 max-w-[560px] text-[13.5px] leading-[1.5] text-surface/65">Open the visible Fitly folder in Google Drive any time to keep or download your files. Deleting your account removes your Fitly records and the Drive files Fitly created.</p>
      </section>
      <div className="mt-4"><DeleteAccountPanel /></div>
    </>
  );
}
