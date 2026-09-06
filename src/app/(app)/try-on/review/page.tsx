import { getBodyTemplates, getGarments } from "@/features/sources";
import { ReviewDraft } from "@/features/try-on/components/review-draft";
import { PageHeader } from "@/shared/components/page-header";

export default async function ReviewStepPage() {
  const [templates, garments] = await Promise.all([getBodyTemplates(), getGarments()]);
  return <><PageHeader eyebrow="Step 3 of 3" title="Check the mirror" description="Confirm the exact body template and garment before using one daily try-on." /><div className="mx-auto max-w-[850px] px-5 py-8 sm:px-8 lg:px-12"><ReviewDraft templates={templates} garments={garments} /></div></>;
}
