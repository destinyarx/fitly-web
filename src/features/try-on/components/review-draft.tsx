"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BodyTemplate, Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function ReviewDraft({ garments, templates }: { readonly garments: readonly Garment[]; readonly templates: readonly BodyTemplate[] }) {
  const router = useRouter();
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const bodyTemplateId = useTryOnDraftStore((state) => state.bodyTemplateId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const garment = garments.find((item) => item.id === garmentId);
  const template = templates.find((item) => item.id === bodyTemplateId);
  if (!garment || !template) return <div className="rounded-[24px] bg-white p-7 text-center"><h2 className="font-display text-2xl font-extrabold">Your draft is incomplete</h2><button className="mt-4 font-bold text-violet" onClick={() => router.replace("/try-on/garment")}>Start again</button></div>;

  async function generate() {
    setIsSubmitting(true); setError(null);
    const response = await fetch("/api/try-on", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ garmentId, bodyTemplateId }) });
    const result: unknown = await response.json();
    if (!response.ok || typeof result !== "object" || result === null || !("resultId" in result) || typeof result.resultId !== "string") {
      setIsSubmitting(false); setError(response.status === 429 ? "You have used today’s three try-ons." : response.status === 409 ? "Reconnect Drive or replace a missing source, then try again." : "Generation could not be started. Nothing was counted."); return;
    }
    router.push(`/try-on/generating?result=${encodeURIComponent(result.resultId)}`);
  }

  return <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">{[{ id: template.id, kind: "body-template" as const, title: template.name, meta: template.pose === "full" ? "Full body" : "Waist up" }, { id: garment.id, kind: "garment" as const, title: garment.name, meta: `${garment.brand ?? "No brand"} · ${garment.category}` }].map((item) => <article key={item.id} className="overflow-hidden rounded-[26px] bg-white"><div className="relative aspect-[4/5] max-h-[420px]"><PrivateImage id={item.id} kind={item.kind} alt={item.title} /></div><div className="p-5"><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-xs capitalize text-text-secondary">{item.meta}</p></div></article>)}<div className="lg:col-span-2 rounded-[26px] bg-ink-deep p-6 text-surface"><p className="text-sm leading-6 text-surface/65">Fitly will temporarily stage these two private Drive images, generate one preview, then purge the staging files. The finished look returns to your Google Drive.</p>{error ? <p role="alert" className="mt-4 rounded-2xl bg-coral/15 p-3 text-sm font-bold text-coral">{error}</p> : null}<button onClick={generate} disabled={isSubmitting} className="mt-5 min-h-13 w-full rounded-full bg-marigold px-6 font-bold text-ink disabled:opacity-50">{isSubmitting ? "Preparing your mirror…" : "Generate this look"}</button></div></div>;
}
