import { getBodyTemplates, getGarments } from "@/features/sources";
import { ReviewDraft } from "@/features/try-on";
import { getGenerationQuota } from "@/features/try-on/server";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";

export default async function ReviewStepPage() {
  const [templates, garments, quota] = await Promise.all([
    getBodyTemplates(),
    getGarments(),
    getGenerationQuota().catch(() => null),
  ]);

  return (
    <>
      <PageHeader
        crumb="Mirror"
        title="Try-on studio"
        description="Confirm the exact body template and garment before using one daily try-on."
        actions={<AppLink href="/try-on/garment" variant="ghost">Change garment</AppLink>}
      />
      <div className="mx-auto w-full max-w-[1560px] px-5 pt-[22px] pb-[60px] md:px-7"><ReviewDraft templates={templates} garments={garments} quota={quota} /></div>
    </>
  );
}
