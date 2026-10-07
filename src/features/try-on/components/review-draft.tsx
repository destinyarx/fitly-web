"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BodyTemplate, Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useGenerationQuota } from '../hooks/use-generation-quota';
import { DAILY_LIMIT_MESSAGE, quotaReachedSchema, type GenerationQuota } from '../quota.schema';
import { getGenerationQuota } from '../services/quota';
import { tryOnKeys } from '../try-on.keys';

import { useTryOnDraftStore } from "../stores/try-on-draft.store";
import { DraftStage } from "./draft-stage";

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
    return <div className="panel mx-auto max-w-xl p-7 text-center"><h2 className="font-display text-2xl font-extrabold">Your draft is incomplete</h2><p className="mt-2 text-sm text-text-secondary">Pick a garment and a body template before generating.</p><button type="button" className="mt-4 min-h-11 font-bold text-violet" onClick={() => router.replace("/try-on/garment")}>Start again</button></div>;
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

  const remaining = currentQuota?.remaining ?? 0;
  const limit = currentQuota?.limit ?? 3;
  const selections = [
    { step: "Step 1 · The garment", id: garment.id, kind: "garment" as const, title: garment.name, meta: [garment.brand, garment.price, garment.category].filter(Boolean).join(" · "), href: "/try-on/garment" },
    { step: "Step 2 · Your model", id: template.id, kind: "body-template" as const, title: template.name, meta: template.pose === "full" ? "Full body" : "Waist up", href: "/try-on/body" },
  ];
  const notes = [
    { tag: "1", chip: "bg-violet/12 text-violet", body: `Template: ${template.name}, ${template.pose === "full" ? "full body" : "waist up"} · reusable for every garment.` },
    { tag: "2", chip: "bg-marigold/40 text-ink", body: `Garment: ${garment.name}, from your Drive closet.` },
    { tag: "3", chip: "bg-coral/14 text-coral-deep", body: "Fitly temporarily stages these two private images, generates one preview, then purges the staging copies. The finished look returns to your Google Drive." },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(240px,304px)_minmax(360px,1fr)_minmax(238px,320px)] xl:items-stretch">
      <div className="order-2 flex flex-col gap-4 xl:order-1">
        {selections.map((item) => (
          <section key={item.id} aria-label={item.step} className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="eyebrow flex-1">{item.step}</h2>
              <Link href={item.href} className="text-xs font-bold text-violet">Change</Link>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-24 w-[72px] flex-none overflow-hidden rounded-2xl bg-canvas shadow-[inset_0_0_0_2.5px_#FFE066]"><PrivateImage id={item.id} kind={item.kind} alt={item.title} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs capitalize text-text-tertiary">{item.meta}</p>
              </div>
            </div>
          </section>
        ))}
        <section aria-label="Fits left today" className="panel rounded-[22px] px-[19px] py-[17px] xl:mt-auto">
          <div className="flex items-baseline justify-between gap-2.5">
            <h2 className="eyebrow">Fits left today</h2>
            <span className="text-[13px] font-bold whitespace-nowrap text-ink">{currentQuota ? `${remaining} of ${limit}` : "Checking…"}</span>
          </div>
          <div className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-ink/8" role="progressbar" aria-label="Try-ons left today" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={remaining}>
            <div className="h-full rounded-full bg-violet" style={{ width: `${limit ? (remaining / limit) * 100 : 0}%` }} />
          </div>
          <p className="mt-[9px] text-xs font-medium text-text-tertiary">{currentQuota ? `${currentQuota.used} of ${currentQuota.limit} used · resets at 00:00 UTC` : "Confirming your daily usage"}</p>
          {quotaQuery.isError ? <p role="alert" className="mt-3 text-xs font-bold text-coral-deep">Daily usage is unavailable. <button type="button" onClick={() => void quotaQuery.refetch()} className="min-h-11 text-violet underline">Retry usage check</button></p> : null}
        </section>
      </div>

      <div className="order-1 xl:order-2">
        <DraftStage
          step="review"
          garments={garments}
          templates={templates}
          footer={
            <div className="space-y-2.5">
              {hasReachedLimit ? <p role="alert" className="rounded-2xl bg-coral/15 p-3 text-sm font-bold text-coral">{DAILY_LIMIT_MESSAGE}</p> : null}
              {error ? <p role="alert" className="rounded-2xl bg-coral/15 p-3 text-sm font-bold text-coral">{error}</p> : null}
              <div className="flex flex-wrap items-center gap-2.5 rounded-[22px] bg-surface/9 p-3 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-[9px] rounded-full bg-surface/10 py-[7px] pr-[13px] pl-[7px]">
                  <span aria-hidden="true" className="size-[26px] flex-none rounded-lg bg-linear-150 from-violet-light to-violet-dark" />
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] leading-tight font-bold text-surface">{garment.name}</p>
                    <p className="truncate text-[10.5px] font-semibold text-surface/50 capitalize">{[garment.brand, garment.category].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <span className="flex-1" />
                <span className="rounded-full bg-surface/10 px-3 py-1.5 text-xs font-bold text-marigold">{currentQuota ? `${currentQuota.used}/${currentQuota.limit} used` : "Checking usage..."}</span>
                <button type="button" onClick={generate} disabled={isSubmitting || !canGenerate} className="flex min-h-11 flex-none items-center gap-2 rounded-full bg-linear-150 from-coral to-peach px-[22px] text-sm font-bold whitespace-nowrap text-surface shadow-[0_10px_22px_-12px_rgba(255,92,138,.9)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                  <span aria-hidden="true" className="font-mono text-base leading-none font-extrabold">+</span>
                  {isSubmitting ? "Preparing your mirror..." : "Generate try-on"}
                </button>
              </div>
            </div>
          }
        />
      </div>

      <div className="order-3 flex flex-col gap-4">
        <section aria-labelledby="this-try-on" className="panel p-5">
          <h2 id="this-try-on" className="eyebrow">This try-on</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.tag} className="flex items-start gap-[11px]">
                <span aria-hidden="true" className={`flex size-6 flex-none items-center justify-center rounded-lg font-mono text-[10px] font-extrabold ${note.chip}`}>{note.tag}</span>
                <p className="flex-1 text-[13.5px] leading-[1.45] text-[#5C5470]">{note.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-5 text-[13px] leading-[1.5] text-text-secondary">
          Each generation uses one of your shared daily try-ons. If the AI step fails, the attempt is not counted. Fitly previews appearance, not exact sizing.
        </section>
      </div>
    </div>
  );
}
