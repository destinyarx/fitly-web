import Link from "next/link";

import type { Garment } from "@/features/sources";
import { getGarments } from "@/features/sources";
import { SourceDeleteButton } from "@/features/sources/components/source-delete-button";
import { TryGarmentButton } from "@/features/try-on";
import { AppLink } from "@/shared/components/app-button";
import { LockIcon } from "@/shared/components/icons";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";
import { SideRail } from "@/shared/components/side-rail";
import { GARMENT_CATEGORIES, GARMENT_CATEGORY_LABELS, type GarmentCategory } from "@/shared/types/domain";

type ClosetSearchParams = { category?: string; q?: string; view?: string };
type ClosetView = "grid" | "list";
type ClosetQuery = { readonly category?: GarmentCategory; readonly q?: string; readonly view: ClosetView };

function closetHref({ category, q, view }: ClosetQuery) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (view === "list") params.set("view", "list");
  const query = params.toString();
  return query ? `/closet?${query}` : "/closet";
}

export default async function ClosetPage({ searchParams }: { searchParams: Promise<ClosetSearchParams> }) {
  const allGarments = await getGarments();
  const params = await searchParams;
  const category = GARMENT_CATEGORIES.find((item) => item === params.category);
  const q = params.q?.trim().slice(0, 80) || undefined;
  const view: ClosetView = params.view === "list" ? "list" : "grid";
  const current = { category, q, view };
  const needle = q?.toLowerCase();
  const garments = allGarments.filter((garment) =>
    (!category || garment.category === category) &&
    (!needle || garment.name.toLowerCase().includes(needle) || (garment.brand?.toLowerCase().includes(needle) ?? false)));
  const countFor = (item: GarmentCategory) => allGarments.filter((garment) => garment.category === item).length;

  return (
    <>
      <PageHeader
        crumb="Closet"
        title="Your closet"
        description={`${allGarments.length} ${allGarments.length === 1 ? "garment" : "garments"} saved to your Google Drive. Mobile items stay in the mobile app.`}
        actions={
          <>
            <span aria-disabled="true" className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-full px-[18px] text-[13.5px] font-bold text-ink/50 shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.12)]">
              <LockIcon fill="rgba(30,18,51,.45)" width={10} height={12} />
              Import from link · Coming soon
            </span>
            <AppLink href="/closet/add">Upload garment</AppLink>
          </>
        }
      />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[212px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-[88px]">
          <SideRail
            label="Garment categories"
            title="Categories"
            items={[
              { href: closetHref({ ...current, category: undefined }), label: "All", count: allGarments.length, isActive: !category },
              ...GARMENT_CATEGORIES.map((item) => ({ href: closetHref({ ...current, category: item }), label: GARMENT_CATEGORY_LABELS[item], count: countFor(item), isActive: category === item })),
            ]}
          />
        </div>

        <div className="min-w-0">
          <div className="panel flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[28px] py-2.5 pr-2.5 pl-4">
            <form action="/closet" role="search" className="flex min-w-0 flex-1 items-center gap-[9px] sm:max-w-[320px]">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              {view === "list" ? <input type="hidden" name="view" value="list" /> : null}
              <svg width="15" height="15" viewBox="0 0 16 16" className="flex-none" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="#8A7F9B" strokeWidth="1.7" /><path d="M11 11l3.5 3.5" stroke="#8A7F9B" strokeWidth="1.7" strokeLinecap="round" /></svg>
              <label htmlFor="closet-search" className="sr-only">Filter garments by name or brand</label>
              <input id="closet-search" type="search" name="q" defaultValue={q} maxLength={80} placeholder="Filter garments by name or brand" className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-text-on-dark-muted" />
            </form>
            <div className="flex items-center gap-2.5">
              <span className="text-[12.5px] font-semibold text-text-tertiary">{garments.length} {garments.length === 1 ? "garment" : "garments"}</span>
              <nav aria-label="Closet view" className="flex rounded-full bg-ink/6 p-[3px]">
                {(["grid", "list"] as const).map((item) => (
                  <Link key={item} href={closetHref({ ...current, view: item })} aria-current={view === item ? "page" : undefined} className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-[12.5px] font-bold capitalize ${view === item ? "bg-surface text-ink shadow-[0_1px_4px_rgba(30,18,51,.14)]" : "text-text-secondary"}`}>
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {allGarments.length > 0 && garments.length === 0 ? (
            <div className="panel mt-[18px] p-10 text-center">
              <h2 className="font-display text-2xl font-extrabold">{q ? `Nothing matches “${q}”` : category ? `No ${GARMENT_CATEGORY_LABELS[category].toLowerCase()} saved` : "Nothing here"}</h2>
              <p className="mt-2 text-sm text-text-secondary">Your other garments are still in Closet.</p>
              <div className="mt-6"><AppLink href={closetHref({ view })} variant="ghost">Clear filters</AppLink></div>
            </div>
          ) : view === "list" && garments.length > 0 ? (
            <ClosetTable garments={garments} />
          ) : (
            <ul className="mt-[18px] grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(172px,1fr))]">
              <li>
                <Link href="/closet/add" className="flex h-full min-h-[232px] flex-col items-center justify-center gap-[11px] rounded-[22px] bg-surface p-4 text-center shadow-[inset_0_0_0_2px_rgba(74,42,184,.24)] transition-shadow hover:shadow-[inset_0_0_0_2px_#4A2AB8]">
                  <UploadTile />
                  <span className="text-[13.5px] font-bold text-violet">Upload a garment</span>
                  <span className="text-[11.5px] font-medium text-text-tertiary">{allGarments.length === 0 ? "Your web closet is empty" : "Link import coming soon"}</span>
                </Link>
              </li>
              {garments.map((garment) => <GarmentCard key={garment.id} garment={garment} />)}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function UploadTile() {
  return (
    <span aria-hidden="true" className="flex size-[42px] items-center justify-center rounded-[14px] bg-violet">
      <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 12.5V3.5M5.6 6.6L9 3.2l3.4 3.4" fill="none" stroke="#FFF6EC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12v2.2A1.8 1.8 0 004.8 16h8.4A1.8 1.8 0 0015 14.2V12" fill="none" stroke="#FFF6EC" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </span>
  );
}

function garmentMeta(garment: Garment) {
  return [garment.brand, garment.price].filter(Boolean).join(" · ") || "No brand";
}

function GarmentCard({ garment }: { readonly garment: Garment }) {
  const isMissing = garment.availabilityStatus === "missing";
  return (
    <li className="panel overflow-hidden rounded-[22px] transition hover:-translate-y-[3px] hover:shadow-[0_18px_32px_-24px_rgba(30,18,51,.55)]">
      <div className="relative aspect-[10/9] bg-lilac-soft">
        <PrivateImage kind="garment" id={garment.id} alt={garment.name} />
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/76 px-[9px] py-1 font-mono text-[9px] font-bold tracking-[0.08em] text-surface uppercase">{garment.category}</span>
        {isMissing ? <span className="absolute inset-x-2 top-2 rounded-full bg-coral-deep px-3 py-1.5 text-center text-[10px] font-bold text-white">Missing from Drive</span> : null}
      </div>
      <div className="px-[13px] pt-[11px] pb-[13px]">
        <h2 className="truncate text-[13.5px] font-bold tracking-[-0.02em] text-ink">{garment.name}</h2>
        <p className="mt-0.5 truncate text-xs font-medium text-text-tertiary">{garmentMeta(garment)}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <TryGarmentButton garmentId={garment.id} garmentName={garment.name} isMissing={isMissing} />
          <SourceDeleteButton id={garment.id} kind="garment" name={garment.name} />
        </div>
      </div>
    </li>
  );
}

function ClosetTable({ garments }: { readonly garments: readonly Garment[] }) {
  return (
    <div className="panel mt-[18px] overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead className="bg-ink/4.5">
          <tr className="font-mono text-[10px] font-bold tracking-[0.1em] text-text-tertiary">
            <th scope="col" className="w-[76px] py-[13px] pl-5"><span className="sr-only">Image</span></th>
            <th scope="col" className="px-2">GARMENT</th>
            <th scope="col" className="hidden px-2 md:table-cell">BRAND</th>
            <th scope="col" className="hidden px-2 sm:table-cell">CATEGORY</th>
            <th scope="col" className="hidden px-2 lg:table-cell">STATUS</th>
            <th scope="col" className="pr-5"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {garments.map((garment) => {
            const isMissing = garment.availabilityStatus === "missing";
            return (
              <tr key={garment.id} className="border-t border-ink/6 transition-colors hover:bg-violet/5">
                <td className="py-[11px] pl-5">
                  <div className="relative size-11 overflow-hidden rounded-xl bg-lilac-soft"><PrivateImage kind="garment" id={garment.id} alt="" /></div>
                </td>
                <td className="px-2 text-sm font-bold tracking-[-0.02em] text-ink">{garment.name}</td>
                <td className="hidden px-2 text-[13px] font-medium text-text-secondary md:table-cell">{garment.brand ?? "—"}</td>
                <td className="hidden px-2 text-xs font-bold tracking-[0.06em] text-text-tertiary uppercase sm:table-cell">{garment.category}</td>
                <td className={`hidden px-2 text-[13px] font-medium lg:table-cell ${isMissing ? "text-coral-deep" : "text-text-secondary"}`}>{isMissing ? "Missing from Drive" : garment.price ?? "Saved"}</td>
                <td className="pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <TryGarmentButton garmentId={garment.id} garmentName={garment.name} isMissing={isMissing} />
                    <SourceDeleteButton id={garment.id} kind="garment" name={garment.name} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
