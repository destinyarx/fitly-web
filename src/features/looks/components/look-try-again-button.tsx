"use client";

import { useRouter } from "next/navigation";

import { useTryOnDraftStore } from "@/features/try-on/stores/try-on-draft.store";

/** Starts a new draft with the look's garment and jumps to the body step. */
export function LookTryAgainButton({ garmentId }: { readonly garmentId: string | null }) {
  const router = useRouter();
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  if (!garmentId) {
    return <span className="flex min-h-9 flex-1 items-center justify-center rounded-full bg-ink/5 text-xs font-bold text-text-tertiary">Garment removed</span>;
  }
  return (
    <button
      type="button"
      onClick={() => { setGarmentId(garmentId); router.push("/try-on/body"); }}
      className="min-h-9 flex-1 rounded-full bg-violet/10 text-xs font-bold text-violet transition-colors hover:bg-violet hover:text-surface"
    >
      Try again
    </button>
  );
}
