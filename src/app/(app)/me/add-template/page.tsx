import { BodyUploadForm } from "@/features/try-on/components/body-upload-form";
import { PageHeader } from "@/shared/components/page-header";

export default function AddTemplatePage() {
  return (
    <>
      <PageHeader eyebrow="Body templates" title="Set your mirror" description="Add a reusable web body template. Fitly stores it in your Google Drive." />
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 lg:px-12">
        <section className="rounded-[30px] bg-white p-5 sm:p-7"><BodyUploadForm afterSave="/me" /></section>
      </div>
    </>
  );
}
