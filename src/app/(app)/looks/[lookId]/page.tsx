import { notFound } from "next/navigation";

import { isLookSettled, LookActions, LookStatusRefresh } from "@/features/looks";
import { getLooks } from "@/features/looks/server";
import { ImageLoadingState } from '@/shared/components/image-loading-state';
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";

export default async function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const lookId = (await params).lookId;
  const look = (await getLooks()).find((item) => item.id === lookId);
  if (!look) notFound();
  const isSettled = isLookSettled({ generation_status: look.generationStatus, delivery_status: look.deliveryStatus });
  const isSaving = look.generationStatus === 'completed' && !isSettled;

  return (
    <>
      <PageHeader eyebrow="Saved look" title={look.garmentName} description={`Generated ${new Date(look.createdAt).toLocaleString()}.`} actions={<LookActions lookId={look.id} garmentId={look.garmentId} isFavorite={look.isFavorite} canUseImage={look.generationStatus === 'completed' && isSettled} canRetryDelivery={look.deliveryStatus === "failed"} />} />
      <div className="mx-auto grid max-w-[1050px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:px-12">
        <section className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-lilac-soft">
          {look.generationStatus === 'completed' && isSettled ? <PrivateImage key={`${look.id}-${look.deliveryStatus}`} kind="look" id={look.id} alt={`Try-on with ${look.garmentName}`} /> : look.generationStatus === 'failed' ? <div role="alert" className="absolute inset-0 flex items-center justify-center px-6 text-center font-bold text-coral-deep">{look.failureReason ?? 'Generation failed. This attempt was not counted.'}</div> : <ImageLoadingState title={isSaving ? 'Saving to Google Drive' : look.generationStatus === 'queued' ? 'Your look is queued' : 'Creating your preview'} description={isSaving ? 'Your image is generated. It will appear as soon as your private Drive copy is ready.' : 'Fitly is processing your body template and garment. You can leave this page and come back.'} />}
        </section>
        <aside className="self-start rounded-[28px] bg-white p-6">
          <p className="text-[10px] font-extrabold tracking-[.14em] text-violet uppercase">Fit notes</p>
          <h2 className="font-display mt-2 text-2xl font-extrabold">Your generated preview</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div><dt className="text-text-tertiary">Garment</dt><dd className="mt-1 font-bold">{look.garmentName}</dd></div>
            <div><dt className="text-text-tertiary">Category</dt><dd className="mt-1 font-bold capitalize">{look.garmentCategory}</dd></div>
            <div><dt className="text-text-tertiary">Drive delivery</dt><dd className={`mt-1 font-bold capitalize ${look.deliveryStatus === "failed" ? "text-coral-deep" : ""}`}>{look.deliveryStatus}</dd></div>
          </dl>
          {!isSettled ? <><p role="status" className="mt-6 rounded-2xl bg-lilac-soft p-4 text-xs leading-5 text-violet">{isSaving ? 'Your look is ready. Saving it privately to Google Drive…' : 'Your look is still processing. This page updates automatically.'}</p><LookStatusRefresh look={look} /></> : null}
          {look.deliveryStatus === "failed" ? <p className="mt-6 rounded-2xl bg-coral/10 p-4 text-xs leading-5 text-coral-deep">The generation succeeded and remains counted. A private recovery copy is available for seven days; retrying delivery does not rerun the model.</p> : null}
          <p className="mt-6 text-xs leading-5 text-text-tertiary">Fitly previews appearance, not exact sizing or fit.</p>
        </aside>
      </div>
    </>
  );
}
