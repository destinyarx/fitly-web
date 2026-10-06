import { getBodyTemplates, getGarments } from "@/features/sources";
import { ReviewDraft } from "@/features/try-on";
import { getGenerationQuota } from "@/features/try-on/server";
import { PageHeader } from "@/shared/components/page-header";

export default async function ReviewStepPage() {
  const [templates, garments, quota] = await Promise.all([
    getBodyTemplates(),
    getGarments(),
    getGenerationQuota().catch(() => null),
  ]);

  return (
    <>
      <PageHeader eyebrow="Step 3 of 3" title="Check the mirror" description="Confirm the exact body template and garment before using one daily try-on." />
      <div className="mx-auto max-w-[850px] px-5 py-8 sm:px-8 lg:px-12"><ReviewDraft templates={templates} garments={garments} quota={quota} /></div>
    </>
  );
}
