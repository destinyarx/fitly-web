import { getBodyTemplates, getGarments } from "@/features/sources";
import { BodyPicker } from "@/features/try-on/components/body-picker";
import { BodyUploadForm } from "@/features/try-on/components/body-upload-form";
import { PageHeader } from "@/shared/components/page-header";

export default async function BodyStepPage() {
  const [templates, garments] = await Promise.all([getBodyTemplates(), getGarments()]);
  return <><PageHeader eyebrow="Step 2 of 3" title="Choose your body" description="Reuse a saved template or add a new one. Incompatible poses stay visible with a reason." /><div className="mx-auto grid max-w-[1050px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:px-12"><section className="rounded-[30px] bg-white p-5 sm:p-7"><h2 className="font-display mb-5 text-2xl font-extrabold">Saved templates</h2><BodyPicker templates={templates} garments={garments} /></section><section className="rounded-[30px] bg-white p-5 sm:p-7"><BodyUploadForm /></section></div></>;
}
