"use client";

import { useRouter } from "next/navigation";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function DraftSelectButton({ id, kind, children, disabled = false, reason }: { readonly id: string; readonly kind: "garment" | "body"; readonly children: React.ReactNode; readonly disabled?: boolean; readonly reason?: string }) {
  const router = useRouter();
  const setGarment = useTryOnDraftStore((state) => state.setGarmentId);
  const setBody = useTryOnDraftStore((state) => state.setBodyTemplateId);
  return <button type="button" disabled={disabled} title={reason} onClick={() => { if (kind === "garment") { setGarment(id); router.push("/try-on/body"); } else { setBody(id); router.push("/try-on/review"); } }} className="absolute inset-0 rounded-[22px] text-left ring-violet focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-surface/65" aria-label={disabled ? reason : `Choose ${kind}`}>{children}</button>;
}
