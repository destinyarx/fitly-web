import { GarmentUploadForm } from "@/features/try-on/components/garment-upload-form";
import { PageHeader } from "@/shared/components/page-header";

export default function AddGarmentPage() {
  return (
    <>
      <PageHeader eyebrow="Closet" title="Add a garment" description="Save a garment for later without starting a generation." />
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 lg:px-12">
        <section className="rounded-[30px] bg-white p-5 sm:p-7"><GarmentUploadForm afterSave="/closet" selectForTryOn={false} /></section>
      </div>
    </>
  );
}
