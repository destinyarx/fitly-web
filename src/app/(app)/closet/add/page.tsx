import { GarmentUploadForm } from "@/features/try-on/components/garment-upload-form";
import { AppLink } from "@/shared/components/app-button";
import { PageHeader } from "@/shared/components/page-header";

export default function AddGarmentPage() {
  return (
    <>
      <PageHeader crumb="Closet" title="Add a garment" description="Save a garment for later without starting a generation." actions={<AppLink href="/closet" variant="ghost">Back to closet</AppLink>} />
      <div className="mx-auto w-full max-w-2xl px-5 pt-[22px] pb-[60px] md:px-7">
        <section className="panel rounded-[28px] p-5 sm:p-7"><GarmentUploadForm afterSave="/closet" selectForTryOn={false} /></section>
      </div>
    </>
  );
}
