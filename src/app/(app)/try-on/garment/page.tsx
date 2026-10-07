import Link from "next/link";

import { getBodyTemplates, getGarments } from "@/features/sources";
import { DraftStage } from "@/features/try-on/components/draft-stage";
import { GarmentPicker } from "@/features/try-on/components/garment-picker";
import { GarmentUploadForm } from "@/features/try-on/components/garment-upload-form";
import { LockIcon } from "@/shared/components/icons";
import { PageHeader } from "@/shared/components/page-header";

export default async function GarmentStepPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const [garments, templates] = await Promise.all([getGarments(), getBodyTemplates()]);
  const source = (await searchParams).source === "closet" ? "closet" : "upload";

  return (
    <>
      <PageHeader crumb="Mirror" title="Try-on studio" description="Bring a garment, pick a body template, generate. No camera needed on web." />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="garment-step" className="panel p-5">
          <h2 id="garment-step" className="eyebrow">Step 1 · The garment</h2>
          <nav aria-label="Garment source" className="mt-3 flex rounded-full bg-ink/6 p-[3px]">
            <SourceTab href="/try-on/garment" isActive={source === "upload"}>Upload</SourceTab>
            <SourceTab href="/try-on/garment?source=closet" isActive={source === "closet"}>Closet</SourceTab>
            <span aria-disabled="true" title="Coming soon" className="flex min-h-9 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-full text-[12.5px] font-bold text-text-tertiary">
              <LockIcon fill="#8A7F9B" width={9} height={11} />
              Link · Soon
            </span>
          </nav>
          <div className="mt-3.5">
            {source === "closet" ? <GarmentPicker garments={garments} /> : <GarmentUploadForm />}
          </div>
          <p className="mt-3 text-xs leading-[1.4] text-text-tertiary">Retailer link import is coming soon. For now, save a product photo and upload it here.</p>
        </section>
        <div className="hidden lg:block">
          <DraftStage step="garment" garments={garments} templates={templates} />
        </div>
      </div>
    </>
  );
}

function SourceTab({ children, href, isActive }: { readonly children: React.ReactNode; readonly href: string; readonly isActive: boolean }) {
  return <Link href={href} aria-current={isActive ? "page" : undefined} className={`flex min-h-9 flex-1 items-center justify-center rounded-full text-[12.5px] font-bold ${isActive ? "bg-surface text-ink shadow-[0_1px_4px_rgba(30,18,51,.14)]" : "text-text-secondary hover:text-ink"}`}>{children}</Link>;
}
