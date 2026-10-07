import { BodyUploadForm } from "@/features/try-on/components/body-upload-form";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";

export default function AddTemplatePage() {
  return (
    <>
      <PageHeader crumb="Profile" title="Set your mirror" description="Add a reusable web body template. Fitly stores it in your Google Drive." actions={<AppLink href="/me?tab=templates" variant="ghost">Back to templates</AppLink>} />
      <div className="mx-auto w-full max-w-2xl px-5 pt-[22px] pb-[60px] md:px-7">
        <section className="panel rounded-[28px] p-5 sm:p-7"><BodyUploadForm afterSave="/me?tab=templates" /></section>
      </div>
    </>
  );
}
