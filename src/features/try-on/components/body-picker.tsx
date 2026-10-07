"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BodyTemplate, Garment } from "@/features/sources";
import { getIncompatibilityReason } from "@/shared/types/domain";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function BodyPicker({ garments, templates }: { readonly garments: readonly Garment[]; readonly templates: readonly BodyTemplate[] }) {
  const router = useRouter();
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const bodyTemplateId = useTryOnDraftStore((state) => state.bodyTemplateId);
  const setBodyTemplateId = useTryOnDraftStore((state) => state.setBodyTemplateId);
  const garment = garments.find((item) => item.id === garmentId);
  if (!garment) return <div className="rounded-2xl bg-marigold/25 p-5 text-sm"><strong>Choose a garment first.</strong><button type="button" className="ml-2 min-h-11 font-bold text-violet" onClick={() => router.replace("/try-on/garment")}>Go back</button></div>;
  if (templates.length === 0) return <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-text-secondary">No body templates yet. Upload one below to continue.</p>;
  return (
    <div className="grid grid-cols-3 gap-2">
      {templates.map((template) => {
        const reason = getIncompatibilityReason(template.pose, garment.category) ?? (template.availabilityStatus === "missing" ? "This photo is missing from Drive" : undefined);
        const disabled = Boolean(reason);
        const isSelected = template.id === bodyTemplateId;
        return (
          <button
            key={template.id}
            disabled={disabled}
            title={reason}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${template.name}, ${template.pose === "full" ? "full body" : "waist up"}${reason ? `. ${reason}` : ""}`}
            onClick={() => { setBodyTemplateId(template.id); router.push("/try-on/review"); }}
            className="group text-left disabled:cursor-not-allowed"
          >
            <span className={`relative block aspect-[3/4] overflow-hidden rounded-2xl bg-canvas group-disabled:opacity-45 ${isSelected ? "shadow-[inset_0_0_0_2.5px_#FFE066]" : "shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.1)]"}`}>
              <PrivateImage kind="body-template" id={template.id} alt="" />
              <span className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-[3px] font-mono text-[8.5px] font-bold tracking-[0.07em] ${isSelected ? "bg-marigold text-ink" : "bg-ink/72 text-surface"}`}>{template.pose === "full" ? "FULL" : "WAIST"}</span>
              {template.isPrimary ? <span className="absolute top-1.5 right-1.5 rounded-full bg-marigold px-1.5 py-0.5 font-mono text-[8px] font-extrabold text-ink">MAIN</span> : null}
            </span>
            <span className="mt-1.5 block truncate text-[11.5px] font-bold text-ink">{template.name}</span>
            {reason ? <span className="block text-[10.5px] leading-tight font-semibold text-coral-deep">{reason}</span> : null}
          </button>
        );
      })}
      {templates.length < 5 ? (
        <Link href="#new-template" className="flex aspect-[3/4] flex-col items-center justify-center gap-[5px] rounded-2xl bg-white text-center shadow-[inset_0_0_0_2px_rgba(74,42,184,.24)] hover:shadow-[inset_0_0_0_2px_#4A2AB8]">
          <span aria-hidden="true" className="font-mono text-[17px] font-extrabold text-violet">+</span>
          <span className="text-[10.5px] leading-[1.2] font-bold text-violet">Upload<br />photo</span>
        </Link>
      ) : null}
    </div>
  );
}
