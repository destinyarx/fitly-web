import { getGarments } from "@/features/sources";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";

export default async function ClosetPage() {
  const garments = await getGarments();
  return <><PageHeader eyebrow="Saved on Drive" title="Closet" description="Your reusable web garment library. Mobile items stay in the mobile app." actions={<AppLink href="/try-on/garment">Add garment</AppLink>} /><section className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">{garments.length === 0 ? <div className="rounded-[30px] bg-white p-10 text-center"><h2 className="font-display text-2xl font-extrabold">Nothing hanging here yet</h2><p className="mt-2 text-sm text-text-secondary">Upload a garment to start your web closet.</p><div className="mt-6"><AppLink href="/try-on/garment">Add a garment</AppLink></div></div> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{garments.map((garment) => <article key={garment.id} className="overflow-hidden rounded-[24px] bg-white"><div className="relative aspect-[4/5] bg-lilac-soft"><PrivateImage kind="garment" id={garment.id} alt={garment.name} />{garment.availabilityStatus === "missing" ? <span className="absolute inset-x-3 bottom-3 rounded-full bg-coral px-3 py-2 text-center text-[10px] font-bold text-white">Missing from Drive</span> : null}</div><div className="p-4"><h2 className="truncate text-sm font-bold">{garment.name}</h2><p className="mt-1 text-[11px] text-text-tertiary">{garment.brand ?? "No brand"} · <span className="capitalize">{garment.category}</span></p></div></article>)}</div>}</section></>;
}
