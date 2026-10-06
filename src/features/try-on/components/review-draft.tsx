"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BodyTemplate, Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useGenerationQuota } from '../hooks/use-generation-quota';
import { DAILY_LIMIT_MESSAGE, quotaReachedSchema, type GenerationQuota } from '../quota.schema';
import { getGenerationQuota } from '../services/quota';
import { tryOnKeys } from '../try-on.keys';

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

type ReviewDraftProps = {
  readonly garments: readonly Garment[];
  readonly quota: GenerationQuota | null;
  readonly templates: readonly BodyTemplate[];
};

export function ReviewDraft({ garments, quota, templates }: ReviewDraftProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const quotaQuery = useGenerationQuota(quota);
  const currentQuota = quotaQuery.data;
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const bodyTemplateId = useTryOnDraftStore((state) => state.bodyTemplateId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const garment = garments.find((item) => item.id === garmentId);
  const template = templates.find((item) => item.id === bodyTemplateId);
  const hasReachedLimit = currentQuota?.remaining === 0;
  const canGenerate = Boolean(currentQuota) && !quotaQuery.isError && !hasReachedLimit;

  if (!garment || !template) {
    return <div className="rounded-[24px] bg-white p-7 text-center"><h2 className="font-display text-2xl font-extrabold">Your draft is incomplete</h2><button className="mt-4 font-bold text-violet" onClick={() => router.replace("/try-on/garment")}>Start again</button></div>;
  }

  async function generate() {
    setIsSubmitting(true);
    setError(null);
    try {
      const latestQuota = await getGenerationQuota();
      queryClient.setQueryData(tryOnKeys.quota, latestQuota);
      if (latestQuota.remaining === 0) {
        setError(DAILY_LIMIT_MESSAGE);
        return;
      }
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ garmentId, bodyTemplateId }),
      });
      const result: unknown = await response.json();
      const quotaFailure = quotaReachedSchema.safeParse(result);
      if (quotaFailure.success) {
        queryClient.setQueryData(tryOnKeys.quota, quotaFailure.data.quota);
        setError(DAILY_LIMIT_MESSAGE);
        return;
      }
      if (!response.ok || typeof result !== "object" || result === null || !("resultId" in result) || typeof result.resultId !== "string") {
        setError(response.status === 429 ? DAILY_LIMIT_MESSAGE : response.status === 409 ? "Reconnect Drive or replace a missing source, then try again." : "Generation could not be started. Nothing was counted.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: tryOnKeys.quota });
      router.push(`/try-on/generating?result=${encodeURIComponent(result.resultId)}`);
    } catch {
      setError("We couldn't confirm your daily usage or start generation. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selections = [
    { id: template.id, kind: "body-template" as const, title: template.name, meta: template.pose === "full" ? "Full body" : "Waist up" },
    { id: garment.id, kind: "garment" as const, title: garment.name, meta: `${garment.brand ?? "No brand"} · ${garment.category}` },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {selections.map((item) => <article key={item.id} className="overflow-hidden rounded-[26px] bg-white"><div className="relative aspect-[4/5] max-h-[420px]"><PrivateImage id={item.id} kind={item.kind} alt={item.title} /></div><div className="p-5"><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-xs capitalize text-text-secondary">{item.meta}</p></div></article>)}
      <div className="rounded-[26px] bg-ink-deep p-6 text-surface lg:col-span-2">
        <div className="flex items-center justify-between gap-4"><p className="text-sm font-bold">Daily use</p><span className="rounded-full bg-surface/10 px-3 py-1 text-xs font-bold text-marigold">{currentQuota ? `${currentQuota.used}/${currentQuota.limit} used` : "Checking usage..."}</span></div>
        <p className="mt-3 text-sm leading-6 text-surface/65">Fitly will temporarily stage these two private Drive images, generate one preview, then purge the staging files. The finished look returns to your Google Drive.</p>
        {hasReachedLimit ? <p className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm font-bold text-coral">{DAILY_LIMIT_MESSAGE}</p> : null}
        {quotaQuery.isError ? <p role="alert" className="mt-4 text-sm text-coral">Daily usage is unavailable. <button type="button" onClick={() => void quotaQuery.refetch()} className="min-h-11 underline">Retry usage check</button></p> : null}
        {error ? <p role="alert" className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm font-bold text-coral">{error}</p> : null}
        <button type="button" onClick={generate} disabled={isSubmitting || !canGenerate} className="mt-5 min-h-13 w-full rounded-full bg-marigold px-6 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Preparing your mirror..." : "Generate this look"}</button>
      </div>
    </div>
  );
}
