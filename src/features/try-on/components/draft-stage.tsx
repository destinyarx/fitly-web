"use client";

import Link from "next/link";

import type { BodyTemplate, Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export type DraftStep = "garment" | "body" | "review";

const STEPS: readonly { readonly key: DraftStep; readonly label: string; readonly href: string }[] = [
  { key: "garment", label: "Garment", href: "/try-on/garment" },
  { key: "body", label: "Body", href: "/try-on/body" },
  { key: "review", label: "Generate", href: "/try-on/review" },
];

const COMPANION_LINES: Record<DraftStep, string> = {
  garment: "Bring me one garment. A clean product photo works best, and I'll keep it in your Drive closet for next time.",
  body: "Good pick. Now choose the body template I should dress. Waist-up templates can't wear bottoms, dresses or shoes.",
  review: "Everything is in place. Generate when you're ready. It usually takes under a minute.",
};

type DraftStageProps = {
  readonly step: DraftStep;
  readonly garments: readonly Garment[];
  readonly templates: readonly BodyTemplate[];
  readonly footer?: React.ReactNode;
};

/** The dark mirror stage: the draft's body template and garment side by side. */
export function DraftStage({ footer, garments, step, templates }: DraftStageProps) {
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const bodyTemplateId = useTryOnDraftStore((state) => state.bodyTemplateId);
  const garment = garments.find((item) => item.id === garmentId);
  const template = templates.find((item) => item.id === bodyTemplateId);

  return (
    <section aria-label="Mirror stage" className="stage flex min-h-[560px] flex-col p-[18px] lg:min-h-[668px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(110deg,rgba(255,255,255,.03)_0_3px,rgba(255,255,255,0)_3px_10px)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[230px] animate-sweep-y bg-linear-to-b from-lilac/14 to-transparent" />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <ol className="flex rounded-full bg-surface/14 p-[3px] backdrop-blur-md">
          {STEPS.map((item, index) => (
            <li key={item.key}>
              <span aria-current={item.key === step ? "step" : undefined} className={`flex min-h-8 items-center rounded-full px-3.5 text-[12.5px] font-bold ${item.key === step ? "bg-surface text-ink" : "text-surface/70"}`}>
                {index + 1} · {item.label}
              </span>
            </li>
          ))}
        </ol>
        <span className="rounded-full bg-surface/14 px-[13px] py-[7px] font-mono text-[10px] font-bold tracking-[0.1em] whitespace-nowrap text-surface/78">UPLOAD ONLY ON WEB</span>
      </div>

      <div className="relative mt-4 flex items-start gap-[11px] rounded-[22px_22px_22px_8px] bg-surface/95 px-[15px] py-[13px] shadow-[0_18px_34px_-18px_rgba(0,0,0,.8)]">
        <span aria-hidden="true" className="flex size-[27px] flex-none items-center justify-center rounded-[50%_50%_50%_9px] bg-marigold">
          <span className="h-3 w-[9px] rounded-[50%/60%_60%_40%_40%] bg-violet" />
        </span>
        <p className="flex-1 text-[13.5px] leading-[1.42] text-ink">{COMPANION_LINES[step]}</p>
      </div>

      <div className="relative my-6 flex flex-1 items-stretch justify-center gap-3.5 px-1 sm:px-2">
        <StageSlot
          label="YOUR MODEL"
          caption={template ? (template.pose === "full" ? "Full body" : "Waist up") : undefined}
          changeHref={template && step !== "body" ? "/try-on/body" : undefined}
          emptyTitle={step === "garment" ? "Next: your body" : "Choose a body template"}
          emptyHint="Pick one of your saved templates"
        >
          {template ? <PrivateImage kind="body-template" id={template.id} alt={`Body template ${template.name}`} /> : null}
        </StageSlot>
        <span aria-hidden="true" className="flex size-8 flex-none self-center items-center justify-center rounded-full bg-marigold font-mono text-lg font-extrabold text-ink shadow-[0_4px_12px_rgba(20,12,40,.6)]">+</span>
        <StageSlot
          label="THE GARMENT"
          caption={garment?.name}
          changeHref={garment && step !== "garment" ? "/try-on/garment" : undefined}
          emptyTitle="Drop the garment here"
          emptyHint="PNG, JPG or WebP"
        >
          {garment ? <PrivateImage kind="garment" id={garment.id} alt={garment.name} /> : null}
        </StageSlot>
      </div>

      {footer ? <div className="relative">{footer}</div> : null}
    </section>
  );
}

type StageSlotProps = {
  readonly label: string;
  readonly caption?: string;
  readonly changeHref?: string;
  readonly emptyTitle: string;
  readonly emptyHint: string;
  readonly children: React.ReactNode;
};

function StageSlot({ caption, changeHref, children, emptyHint, emptyTitle, label }: StageSlotProps) {
  if (!children) {
    return (
      <div className="flex min-h-[260px] max-w-[236px] min-w-0 flex-[1_1_50%] flex-col items-center justify-center gap-[11px] rounded-[26px] bg-surface/5 px-3 py-[18px] text-center shadow-[inset_0_0_0_2px_rgba(255,246,236,.32)]">
        <span aria-hidden="true" className="flex size-[46px] items-center justify-center rounded-2xl bg-surface/12">
          <svg width="21" height="21" viewBox="0 0 18 18"><path d="M9 12.5V3.5M5.6 6.6L9 3.2l3.4 3.4" fill="none" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12v2.2A1.8 1.8 0 004.8 16h8.4A1.8 1.8 0 0015 14.2V12" fill="none" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
        <span className="text-[14.5px] font-bold tracking-[-0.02em] text-surface">{emptyTitle}</span>
        <span className="text-[12.5px] leading-[1.4] font-medium text-surface/55">{emptyHint}</span>
      </div>
    );
  }
  return (
    <div className="relative min-h-[260px] max-w-[236px] min-w-0 flex-[1_1_50%] overflow-hidden rounded-[26px] bg-canvas shadow-[0_0_0_1.5px_rgba(255,246,236,.22)]">
      {children}
      <span className="absolute top-[11px] left-[11px] rounded-full bg-ink/76 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.09em] text-surface">{label}</span>
      {caption ? (
        <div className="absolute inset-x-[11px] bottom-[11px] flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-[18px] bg-ink/78 px-3 py-2 backdrop-blur-md">
          <span className="min-w-0 truncate text-[11.5px] font-semibold text-surface/78">{caption}</span>
          {changeHref ? <Link href={changeHref} className="text-[11.5px] font-bold text-marigold">Change</Link> : null}
        </div>
      ) : null}
    </div>
  );
}
