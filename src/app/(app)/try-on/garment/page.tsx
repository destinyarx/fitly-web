import { getGarments } from "@/features/sources";
import { GarmentPicker } from "@/features/try-on/components/garment-picker";
import { GarmentUploadForm } from "@/features/try-on/components/garment-upload-form";
import { PageHeader } from "@/shared/components/page-header";

export default async function GarmentStepPage() {
  const garments = await getGarments();
  return <><PageHeader eyebrow="Step 1 of 3" title="Bring a garment" description="Upload a clean product photo or choose something already in your web closet." /><div className="mx-auto grid max-w-[1050px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.12fr_.88fr] lg:px-12"><section className="rounded-[30px] bg-white p-5 sm:p-7"><div className="mb-5 flex gap-2"><span className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-surface">Upload</span><span title="Coming soon" className="cursor-not-allowed rounded-full bg-ink/5 px-4 py-2 text-xs font-bold text-text-tertiary">Product URL · Coming soon</span></div><GarmentUploadForm /></section><section className="rounded-[30px] bg-white p-5 sm:p-7"><h2 className="font-display text-2xl font-extrabold">Or pick from Closet</h2><p className="mb-5 mt-1 text-xs text-text-secondary">Choose one saved web garment.</p><GarmentPicker garments={garments} /></section></div></>;
}
