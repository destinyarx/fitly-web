"use client";

import { useRouter } from "next/navigation";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

/** Puts a closet garment into the draft and continues to the body step. */
export function TryGarmentButton({ garmentId, garmentName, isMissing }: { readonly garmentId: string; readonly garmentName: string; readonly isMissing: boolean }) {
  const router = useRouter();
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  return (
    <button
      type="button"
      disabled={isMissing}
      aria-label={isMissing ? `${garmentName} is missing from Drive` : `Try on ${garmentName}`}
      onClick={() => { setGarmentId(garmentId); router.push("/try-on/body"); }}
      className="inline-flex min-h-9 items-center justify-center rounded-full bg-violet/10 px-3.5 text-xs font-bold whitespace-nowrap text-violet transition-colors hover:bg-violet hover:text-surface disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-text-tertiary"
    >
      Try on
    </button>
  );
}
