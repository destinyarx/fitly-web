"use client";

import { useRouter } from "next/navigation";

import type { BodyTemplate, Garment } from "@/features/sources";
import { getIncompatibilityReason } from "@/shared/types/domain";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function BodyPicker({ garments, templates }: { readonly garments: readonly Garment[]; readonly templates: readonly BodyTemplate[] }) {
  const router = useRouter();
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const setBodyTemplateId = useTryOnDraftStore((state) => state.setBodyTemplateId);
  const garment = garments.find((item) => item.id === garmentId);
  if (!garment) return <div className="rounded-2xl bg-marigold/25 p-5 text-sm"><strong>Choose a garment first.</strong><button type="button" className="ml-2 font-bold text-violet" onClick={() => router.replace("/try-on/garment")}>Go back</button></div>;
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{templates.map((template) => { const reason = getIncompatibilityReason(template.pose, garment.category) ?? (template.availabilityStatus === "missing" ? "This photo is missing from Drive" : undefined); const disabled = Boolean(reason); return <button key={template.id} disabled={disabled} title={reason} type="button" onClick={() => { setBodyTemplateId(template.id); router.push("/try-on/review"); }} className="overflow-hidden rounded-[20px] bg-surface text-left shadow-[inset_0_0_0_1px_rgba(30,18,51,.08)] disabled:cursor-not-allowed disabled:opacity-45"><div className="relative aspect-[4/5]"><PrivateImage kind="body-template" id={template.id} alt="" />{template.isPrimary ? <span className="absolute left-2 top-2 rounded-full bg-marigold px-2 py-1 text-[9px] font-extrabold">PRIMARY</span> : null}</div><div className="p-3"><span className="block truncate text-xs font-bold">{template.name}</span><span className="mt-1 block text-[10px] text-text-tertiary">{reason ?? (template.pose === "full" ? "Full body" : "Waist up")}</span></div></button>; })}</div>;
}
