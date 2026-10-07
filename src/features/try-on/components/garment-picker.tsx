"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function GarmentPicker({ garments }: { readonly garments: readonly Garment[] }) {
  const router = useRouter();
  const garmentId = useTryOnDraftStore((state) => state.garmentId);
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  if (garments.length === 0) return <p className="mt-3.5 rounded-2xl bg-white px-4 py-5 text-center text-sm text-text-secondary">Your closet is empty. Switch to Upload to add a garment.</p>;
  return (
    <>
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {garments.map((garment) => {
          const isMissing = garment.availabilityStatus === "missing";
          const isSelected = garment.id === garmentId;
          return (
            <button
              key={garment.id}
              type="button"
              disabled={isMissing}
              aria-pressed={isSelected}
              aria-label={`${garment.name}, ${garment.category}${isMissing ? ". Missing from Drive" : ""}`}
              onClick={() => { setGarmentId(garment.id); router.push("/try-on/body"); }}
              className="group text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className={`relative block aspect-square overflow-hidden rounded-[14px] bg-lilac-soft group-disabled:opacity-45 ${isSelected ? "shadow-[inset_0_0_0_2px_#FFE066]" : ""}`}>
                <PrivateImage kind="garment" id={garment.id} alt="" />
              </span>
              <span className="mt-1.5 block truncate text-[11.5px] font-bold text-ink">{garment.name}</span>
              <span className={`block text-[10.5px] font-semibold capitalize ${isMissing ? "text-coral-deep" : "text-text-tertiary"}`}>{isMissing ? "Missing from Drive" : garment.category}</span>
            </button>
          );
        })}
      </div>
      <Link href="/closet" className="mt-2.5 inline-flex min-h-9 items-center text-[12.5px] font-bold text-violet">Open full closet →</Link>
    </>
  );
}
