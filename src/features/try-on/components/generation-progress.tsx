"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLookSettled, useLookStatus } from '@/features/looks';

export function GenerationProgress({ resultId }: { readonly resultId: string }) {
  const router = useRouter();
  const [hasStoppedWaiting, setHasStoppedWaiting] = useState(false);
  const query = useLookStatus(resultId, hasStoppedWaiting);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasStoppedWaiting(true), 180_000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (query.data?.generation_status === "completed" && isLookSettled(query.data)) {
      const timer = window.setTimeout(() => router.replace(`/looks/${resultId}`), 900);
      return () => window.clearTimeout(timer);
    }
  }, [query.data, resultId, router]);

  const status = query.data?.generation_status ?? 'queued';
  const isSaving = status === 'completed' && !isLookSettled(query.data ?? { generation_status: 'queued', delivery_status: 'pending' });
  const title = isSaving ? 'Your look is ready. Saving it now.' : status === 'queued' ? 'Your look is in the queue' : status === 'failed' ? 'Your look could not be generated' : 'Working the magic';
  return (
    <section aria-live="polite" className="stage mx-auto flex min-h-[560px] max-w-[880px] flex-col items-center justify-center gap-[18px] px-6 py-12 text-center lg:min-h-[668px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(110deg,rgba(255,255,255,.03)_0_3px,rgba(255,255,255,0)_3px_10px)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[230px] animate-sweep-y bg-linear-to-b from-lilac/14 to-transparent" />
      {status === 'failed' ? (
        <span aria-hidden="true" className="relative flex size-[78px] items-center justify-center rounded-full bg-coral/20 font-display text-3xl font-extrabold text-coral">!</span>
      ) : (
        <div aria-hidden="true" className="relative flex size-[78px] items-center justify-center rounded-full bg-[conic-gradient(from_210deg,#FF5C8A,#FFE066,#D9C6FF,#FF5C8A)] motion-safe:animate-spin [animation-duration:3s]">
          <div className="size-[62px] rounded-full bg-[#241844]" />
        </div>
      )}
      <div className="relative">
        <p className="font-mono text-[10.5px] font-bold tracking-[0.11em] text-surface/55 uppercase">{isSaving ? 'Saving to Google Drive' : status}</p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-[-0.03em] text-surface sm:text-[28px]">{title}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-6 text-surface/60">{isSaving ? 'The image is generated. Fitly is saving your private preview to Google Drive before opening it.' : status === 'failed' ? 'This attempt was not counted against your daily try-ons.' : 'Usually takes under a minute. You can leave this page; your look keeps processing and appears in Looks when it is ready.'}</p>
      </div>
      {status !== 'failed' ? (
        <div aria-hidden="true" className="relative flex gap-[5px]">
          <span className="size-1.5 animate-dot-pulse rounded-full bg-marigold" />
          <span className="size-1.5 animate-dot-pulse rounded-full bg-marigold [animation-delay:.16s]" />
          <span className="size-1.5 animate-dot-pulse rounded-full bg-marigold [animation-delay:.32s]" />
        </div>
      ) : null}
      {status === "failed" ? <div role="alert" className="relative max-w-md rounded-2xl bg-coral/15 p-4 text-sm font-bold text-coral">{query.data?.failure_reason ?? "Generation failed. This attempt was not counted."}<div className="mt-3"><Link href="/try-on/garment" className="inline-flex min-h-11 items-center rounded-full bg-linear-150 from-coral to-peach px-5 text-surface">Start a new try-on</Link></div></div> : null}
      {hasStoppedWaiting && status !== "failed" ? <div className="relative max-w-md rounded-2xl bg-marigold/20 p-4 text-sm text-surface">This is taking longer than three minutes. Generation continues on the server. Check <Link href="/looks" className="font-bold text-marigold">Looks</Link> in a little while.</div> : null}
      {query.isError ? <button type="button" onClick={() => query.refetch()} className="relative min-h-11 rounded-full bg-surface px-5 text-sm font-bold text-ink">Retry status check</button> : null}
    </section>
  );
}
