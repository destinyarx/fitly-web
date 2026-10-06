import Link from "next/link";

import { getGarments } from "@/features/sources";
import { SourceDeleteButton } from "@/features/sources/components/source-delete-button";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";
import { GARMENT_CATEGORIES, GARMENT_CATEGORY_LABELS, type GarmentCategory } from "@/shared/types/domain";

export default async function ClosetPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const allGarments = await getGarments();
  const requestedCategory = (await searchParams).category;
  const category = GARMENT_CATEGORIES.find((item) => item === requestedCategory);
  const garments = category
    ? allGarments.filter((garment) => garment.category === category)
    : allGarments;

  return (
    <>
      <PageHeader
        eyebrow="Saved on Drive"
        title="Closet"
        description="Your reusable web garment library. Mobile items stay in the mobile app."
        actions={<AppLink href="/closet/add">Add garment</AppLink>}
      />
      <section className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <nav aria-label="Garment categories" className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <CategoryLink isActive={!category}>All</CategoryLink>
          {GARMENT_CATEGORIES.map((item) => <CategoryLink key={item} category={item} isActive={category === item}>{GARMENT_CATEGORY_LABELS[item]}</CategoryLink>)}
        </nav>
        {garments.length === 0 ? (
          <div className="rounded-[30px] bg-white p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold">{category ? `No ${GARMENT_CATEGORY_LABELS[category].toLowerCase()} saved` : "Nothing hanging here yet"}</h2>
            <p className="mt-2 text-sm text-text-secondary">{category ? "Your other garments are still in Closet." : "Upload a garment to start your web closet."}</p>
            <div className="mt-6">{category ? <AppLink href="/closet" secondary>Clear filter</AppLink> : <AppLink href="/closet/add">Add a garment</AppLink>}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {garments.map((garment) => (
              <article key={garment.id} className="overflow-hidden rounded-[24px] bg-white">
                <div className="relative aspect-[4/5] bg-lilac-soft">
                  <PrivateImage kind="garment" id={garment.id} alt={garment.name} />
                  {garment.availabilityStatus === "missing" ? <span className="absolute inset-x-3 bottom-3 rounded-full bg-coral px-3 py-2 text-center text-[10px] font-bold text-white">Missing from Drive</span> : null}
                </div>
                <div className="p-4">
                  <h2 className="truncate text-sm font-bold">{garment.name}</h2>
                  <p className="mt-1 text-[11px] text-text-tertiary">{garment.brand ?? "No brand"} · <span className="capitalize">{garment.category}</span></p>
                  <SourceDeleteButton id={garment.id} kind="garment" name={garment.name} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CategoryLink({ category, children, isActive }: { readonly category?: GarmentCategory; readonly children: React.ReactNode; readonly isActive: boolean }) {
  const href = category ? `/closet?category=${category}` : "/closet";
  return <Link href={href} aria-current={isActive ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${isActive ? "bg-ink text-surface" : "bg-white text-text-secondary"}`}>{children}</Link>;
}
