import Link from "next/link";

import { LookTryAgainButton } from "@/features/looks";
import type { Look } from "@/features/looks";
import { getLooks } from "@/features/looks/server";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";
import { SideRail } from "@/shared/components/side-rail";

type LooksSearchParams = { filter?: string; category?: string };

function looksHref(filter: "all" | "favorites", category?: string) {
  const params = new URLSearchParams();
  if (filter === "favorites") params.set("filter", "favorites");
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/looks?${query}` : "/looks";
}

export default async function LooksPage({ searchParams }: { searchParams: Promise<LooksSearchParams> }) {
  const allLooks = await getLooks();
  const params = await searchParams;
  const filter = params.filter === "favorites" ? "favorites" : "all";
  const favorites = allLooks.filter((look) => look.isFavorite);
  const inCollection = filter === "favorites" ? favorites : allLooks;
  const categories = [...new Set(inCollection.map((look) => look.garmentCategory))];
  const category = categories.find((item) => item === params.category);
  const looks = category ? inCollection.filter((look) => look.garmentCategory === category) : inCollection;

  return (
    <>
      <PageHeader
        crumb="Looks"
        title="Your looks"
        description={`${allLooks.length} web ${allLooks.length === 1 ? "try-on" : "try-ons"}, delivered privately to your Google Drive`}
        actions={<AppLink href="/try-on/garment">Open the mirror</AppLink>}
      />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[212px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-[88px]">
          <SideRail
            label="Look collections"
            title="Collections"
            items={[
              { href: looksHref("all"), label: "All looks", count: allLooks.length, isActive: filter === "all" },
              { href: looksHref("favorites"), label: "Favorites", count: favorites.length, isActive: filter === "favorites" },
            ]}
          />
        </div>

        <div className="min-w-0">
          <div className="panel flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[28px] px-3.5 py-2.5">
            <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-[7px]">
              <Chip href={looksHref(filter)} isActive={!category}>All</Chip>
              {categories.map((item) => <Chip key={item} href={looksHref(filter, item)} isActive={category === item}><span className="capitalize">{item}</span></Chip>)}
            </nav>
            <span className="text-[12.5px] font-semibold text-text-tertiary">{looks.length} {looks.length === 1 ? "look" : "looks"} · newest first</span>
          </div>

          {looks.length === 0 ? (
            <div className="panel mt-[18px] flex min-h-[420px] flex-col items-center justify-center rounded-[28px] p-8 text-center">
              <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-[22px] bg-lilac-soft text-3xl text-violet">✦</span>
              <h2 className="font-display mt-5 text-3xl font-extrabold tracking-[-.04em]">{filter === "favorites" ? "No favorites yet" : category ? "Nothing in this category" : "Your mirror is ready"}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{filter === "favorites" ? "Favorite a look from its detail page to keep it in this view." : category ? "Your other looks are still here. Clear the filter to see them." : "Bring one garment, choose a body template, and your first look will appear here."}</p>
              <div className="mt-6">{category ? <AppLink href={looksHref(filter)} variant="ghost">Clear filter</AppLink> : filter === "all" ? <AppLink href="/try-on/garment">Start your first try-on</AppLink> : null}</div>
            </div>
          ) : (
            <ul className="mt-[18px] grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))]">
              {looks.map((look) => <LookCard key={look.id} look={look} />)}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function getStatusLabel(look: Look) {
  if (look.generationStatus === "failed") return "Failed";
  if (look.generationStatus === "queued") return "Queued";
  if (look.generationStatus === "generating") return "Generating";
  if (look.deliveryStatus === "failed") return "Retry delivery";
  return look.deliveryStatus === "delivered" ? "Tried on" : "Saving";
}

function LookCard({ look }: { readonly look: Look }) {
  const needsAttention = look.generationStatus === "failed" || look.deliveryStatus === "failed";
  return (
    <li className="panel overflow-hidden transition hover:-translate-y-[3px] hover:shadow-[0_20px_36px_-24px_rgba(30,18,51,.55)]">
      <Link href={`/looks/${look.id}`} className="block text-ink">
        <div className="relative aspect-[4/5] bg-lilac-soft">
          {look.generationStatus === "completed" ? (
            <PrivateImage kind="look" id={look.id} alt={`Try-on with ${look.garmentName}`} />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-2xl text-violet">{look.generationStatus === "failed" ? "!" : "•••"}</div>
          )}
          <span className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${needsAttention ? "bg-coral-deep text-white" : look.deliveryStatus === "delivered" ? "bg-marigold text-ink" : "bg-surface/94 text-violet"}`}>
            {getStatusLabel(look)}
          </span>
          {look.isFavorite ? (
            <span role="img" aria-label="Favorite" className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20l-1.5-1.3C5.4 14.2 2.5 11.6 2.5 8.4A4.6 4.6 0 0112 6.2a4.6 4.6 0 019.5 2.2c0 3.2-2.9 5.8-8 10.3L12 20z" fill="#FF5C8A" stroke="#FFF6EC" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </span>
          ) : null}
        </div>
        <div className="px-[15px] pt-[13px]">
          <h2 className="truncate text-[14.5px] font-bold tracking-[-0.02em]">{look.garmentName}</h2>
          <p className="mt-0.5 text-[12.5px] font-medium text-text-tertiary"><span className="capitalize">{look.garmentCategory}</span> · {new Date(look.createdAt).toLocaleDateString()}</p>
        </div>
      </Link>
      <div className="flex gap-[7px] px-[15px] pt-[11px] pb-[15px]">
        <LookTryAgainButton garmentId={look.garmentId} />
      </div>
    </li>
  );
}

function Chip({ children, href, isActive }: { readonly children: React.ReactNode; readonly href: string; readonly isActive: boolean }) {
  return <Link href={href} aria-current={isActive ? "page" : undefined} className={`inline-flex min-h-9 items-center rounded-full px-[15px] text-[13px] font-bold ${isActive ? "bg-ink text-surface" : "text-text-secondary shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.14)] hover:text-ink"}`}>{children}</Link>;
}
