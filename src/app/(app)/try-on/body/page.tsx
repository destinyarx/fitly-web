import Link from "next/link";

import { getBodyTemplates, getGarments } from "@/features/sources";
import { BodyPicker } from "@/features/try-on/components/body-picker";
import { BodyUploadForm } from "@/features/try-on/components/body-upload-form";
import { DraftStage } from "@/features/try-on/components/draft-stage";
import { PageHeader } from "@/shared/components/page-header";

export default async function BodyStepPage() {
  const [templates, garments] = await Promise.all([getBodyTemplates(), getGarments()]);
  return (
    <>
      <PageHeader crumb="Mirror" title="Try-on studio" description="Choose the body template to dress. Incompatible poses stay visible with a reason." />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <section aria-labelledby="body-step" className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 id="body-step" className="eyebrow flex-1">Step 2 · Your model</h2>
              <Link href="/me?tab=templates" className="text-xs font-bold text-violet">Manage</Link>
            </div>
            <div className="mt-3"><BodyPicker templates={templates} garments={garments} /></div>
          </section>
          {templates.length < 5 ? (
            <section id="new-template" aria-labelledby="new-template-title" className="panel scroll-mt-24 p-5">
              <h2 id="new-template-title" className="eyebrow mb-3">New body template</h2>
              <BodyUploadForm />
            </section>
          ) : null}
        </div>
        <div className="hidden lg:block">
          <DraftStage step="body" garments={garments} templates={templates} />
        </div>
      </div>
    </>
  );
}
