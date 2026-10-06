import Link from "next/link";

import { getLooks } from "@/features/looks/server";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";

export default async function LooksPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const allLooks = await getLooks();
  const filter = (await searchParams).filter === "favorites" ? "favorites" : "all";
  const looks = filter === "favorites"
    ? allLooks.filter((look) => look.isFavorite)
    : allLooks;

  return (
    <>
      <PageHeader
        eyebrow="Your wardrobe mirror"
        title="Looks"
        description="Every web try-on you generate, delivered privately to your Google Drive."
        actions={<AppLink href="/try-on/garment">New try-on</AppLink>}
      />
      <section className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
        <nav aria-label="Look filters" className="mb-6 flex gap-2">
          <FilterLink href="/looks" isActive={filter === "all"}>All looks</FilterLink>
          <FilterLink href="/looks?filter=favorites" isActive={filter === "favorites"}>Favorites</FilterLink>
        </nav>
        {looks.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[32px] bg-white p-8 text-center shadow-[0_24px_60px_-44px_rgba(30,18,51,.5)]">
            <span className="flex size-16 items-center justify-center rounded-[22px] bg-lilac-soft text-3xl text-violet">✦</span>
            <h2 className="font-display mt-5 text-3xl font-extrabold tracking-[-.04em]">{filter === "favorites" ? "No favorites yet" : "Your mirror is ready"}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{filter === "favorites" ? "Favorite a look to keep it in this view." : "Bring one garment, choose a body template, and your first look will appear here."}</p>
            {filter === "all" ? <div className="mt-6"><AppLink href="/try-on/garment">Start your first try-on</AppLink></div> : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {looks.map((look) => (
              <Link key={look.id} href={`/looks/${look.id}`} className="group overflow-hidden rounded-[24px] bg-white shadow-[0_20px_45px_-36px_rgba(30,18,51,.7)]">
                <div className="relative aspect-[4/5] bg-lilac-soft">
                  {look.generationStatus === "completed" ? <PrivateImage kind="look" id={look.id} alt={`Try-on with ${look.garmentName}`} /> : <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"><span className="text-2xl">{look.generationStatus === "failed" ? "!" : "•••"}</span><span className="mt-2 text-xs font-bold capitalize">{look.generationStatus}</span></div>}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2"><h2 className="min-w-0 flex-1 truncate text-sm font-bold">{look.garmentName}</h2>{look.isFavorite ? <span aria-label="Favorite" className="text-coral">♥</span> : null}</div>
                  <p className="mt-1 text-[11px] font-semibold text-text-tertiary capitalize">{look.garmentCategory} · {new Date(look.createdAt).toLocaleDateString()}</p>
                  {look.deliveryStatus === "failed" ? <p className="mt-2 text-[11px] font-bold text-coral-deep">Drive delivery needs retry</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FilterLink({ children, href, isActive }: { readonly children: React.ReactNode; readonly href: string; readonly isActive: boolean }) {
  return <Link href={href} aria-current={isActive ? "page" : undefined} className={`rounded-full px-4 py-2 text-xs font-bold ${isActive ? "bg-ink text-surface" : "bg-white text-text-secondary"}`}>{children}</Link>;
}
