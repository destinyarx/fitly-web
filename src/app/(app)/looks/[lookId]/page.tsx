import { notFound } from "next/navigation";

import { isLookSettled, LookActions, LookStatusRefresh } from "@/features/looks";
import { getLooks } from "@/features/looks/server";
import { AppLink } from "@/shared/components/app-button";
import { ImageLoadingState } from '@/shared/components/image-loading-state';
import { PageHeader } from "@/shared/components/page-header";
import { PrivateImage } from "@/shared/components/private-image";

export default async function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const lookId = (await params).lookId;
  const looks = await getLooks();
  const look = looks.find((item) => item.id === lookId);
  if (!look) notFound();
  const isSettled = isLookSettled({ generation_status: look.generationStatus, delivery_status: look.deliveryStatus });
  const isSaving = look.generationStatus === 'completed' && !isSettled;
  const isReady = look.generationStatus === 'completed' && isSettled;
  const createdAt = new Date(look.createdAt);
  const notes = [
    { tag: "1", chip: "bg-violet/12 text-violet", body: `Garment: ${look.garmentName}, ${look.garmentCategory}.` },
    { tag: "2", chip: "bg-marigold/40 text-ink", body: `Generated ${createdAt.toLocaleString()}.` },
    { tag: "3", chip: "bg-coral/14 text-coral-deep", body: look.deliveryStatus === "delivered" ? "Stored privately in your Google Drive." : look.deliveryStatus === "failed" ? "Drive delivery failed. Retry to save it to your Drive." : "Saving privately to your Google Drive." },
  ];

  return (
    <>
      <PageHeader crumb="Looks" title={look.garmentName} description="Your generated preview. Fitly previews appearance, not exact sizing or fit." actions={<AppLink href="/looks" variant="ghost">All looks</AppLink>} />
      <div className="mx-auto grid w-full max-w-[1560px] gap-5 px-5 pt-[22px] pb-[60px] md:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start">
        <section aria-label="Try-on result" className="stage mx-auto aspect-[4/5] w-full max-w-[640px] lg:max-w-none">
          {isReady ? <PrivateImage key={`${look.id}-${look.deliveryStatus}`} kind="look" id={look.id} alt={`Try-on with ${look.garmentName}`} /> : look.generationStatus === 'failed' ? <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"><span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-coral/20 font-display text-2xl font-extrabold text-coral">!</span><p className="max-w-sm font-bold text-surface">{look.failureReason ?? 'Generation failed. This attempt was not counted.'}</p><AppLink href="/try-on/garment">Generate again</AppLink></div> : <ImageLoadingState title={isSaving ? 'Saving to Google Drive' : look.generationStatus === 'queued' ? 'Your look is queued' : 'Creating your preview'} description={isSaving ? 'Your image is generated. It will appear as soon as your private Drive copy is ready.' : 'Fitly is processing your body template and garment. You can leave this page and come back.'} />}
          {isReady ? (
            <div className="pointer-events-none absolute top-[18px] left-[18px] flex flex-wrap gap-2">
              <span className="rounded-full bg-marigold px-[13px] py-1.5 font-mono text-[10.5px] font-extrabold tracking-[0.1em] text-ink">TRIED ON</span>
              <span className="rounded-full bg-ink/70 px-[13px] py-1.5 font-mono text-[10.5px] font-bold tracking-[0.08em] text-surface/85 backdrop-blur-md">{createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            </div>
          ) : null}
        </section>

        <aside className="flex flex-col gap-4">
          <section aria-labelledby="look-notes" className="panel p-5">
            <h2 id="look-notes" className="eyebrow">This try-on</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note.tag} className="flex items-start gap-[11px]">
                  <span aria-hidden="true" className={`flex size-6 flex-none items-center justify-center rounded-lg font-mono text-[10px] font-extrabold ${note.chip}`}>{note.tag}</span>
                  <p className="flex-1 text-[13.5px] leading-[1.45] text-[#5C5470]">{note.body}</p>
                </li>
              ))}
            </ul>
            {!isSettled ? <><p role="status" className="mt-4 rounded-2xl bg-lilac-soft p-4 text-xs leading-5 text-violet">{isSaving ? 'Your look is ready. Saving it privately to Google Drive…' : 'Your look is still processing. This page updates automatically.'}</p><LookStatusRefresh look={look} /></> : null}
            {look.deliveryStatus === "failed" ? <p className="mt-4 rounded-2xl bg-coral/10 p-4 text-xs leading-5 text-coral-deep">The generation succeeded and remains counted. A private recovery copy is available for seven days; retrying delivery does not rerun the model.</p> : null}
          </section>

          <LookActions lookId={look.id} garmentId={look.garmentId} isFavorite={look.isFavorite} canUseImage={isReady} canRetryDelivery={look.deliveryStatus === "failed"} />
        </aside>
      </div>
    </>
  );
}
