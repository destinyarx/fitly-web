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
  return (
    <div className="mx-auto flex min-h-[500px] max-w-2xl flex-col items-center justify-center px-5 text-center" aria-live="polite">
      <div className="relative flex size-44 items-center justify-center rounded-full bg-ink-deep shadow-[0_30px_80px_-35px_rgba(30,18,51,.8)]"><span className="animate-pulse text-5xl text-marigold">✦</span><span className="absolute inset-3 animate-spin rounded-full border border-transparent border-t-lilac" /></div>
      <p className="mt-7 text-[10px] font-extrabold tracking-[.16em] text-violet uppercase">{isSaving ? 'Saving to Google Drive' : status}</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-.05em]">{isSaving ? 'Your look is ready. Saving it now.' : status === 'queued' ? 'Your look is in the queue' : status === 'failed' ? 'Your look could not be generated' : 'Fitly is dressing the mirror'}</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">{isSaving ? 'The image is generated. Fitly is saving your private preview to Google Drive before opening it.' : 'You can leave this page. Your look keeps processing and will appear in Looks when it is ready.'}</p>
      {status === "failed" ? <div className="mt-6 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral-deep">{query.data?.failure_reason ?? "Generation failed. This attempt was not counted."}<div className="mt-3"><Link href="/try-on/garment" className="text-violet">Start a new try-on</Link></div></div> : null}
      {hasStoppedWaiting && status !== "failed" ? <div className="mt-6 rounded-2xl bg-marigold/25 p-4 text-sm text-ink">This is taking longer than three minutes. Generation continues on the server. Check Looks in a little while.</div> : null}
      {query.isError ? <button type="button" onClick={() => query.refetch()} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-surface">Retry status check</button> : null}
    </div>
  );
}
