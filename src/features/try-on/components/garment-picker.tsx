"use client";

import { useRouter } from "next/navigation";

import type { Garment } from "@/features/sources";
import { PrivateImage } from "@/shared/components/private-image";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

export function GarmentPicker({ garments }: { readonly garments: readonly Garment[] }) {
  const router = useRouter();
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  if (garments.length === 0) return <p className="rounded-2xl bg-surface px-4 py-5 text-center text-sm text-text-secondary">Your closet is empty. Upload a garment above.</p>;
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{garments.map((garment) => <button key={garment.id} type="button" disabled={garment.availabilityStatus === "missing"} onClick={() => { setGarmentId(garment.id); router.push("/try-on/body"); }} className="overflow-hidden rounded-[20px] bg-surface text-left shadow-[inset_0_0_0_1px_rgba(30,18,51,.08)] disabled:opacity-45"><div className="relative aspect-square"><PrivateImage kind="garment" id={garment.id} alt="" /></div><div className="p-3"><span className="block truncate text-xs font-bold">{garment.name}</span><span className="mt-1 block text-[10px] capitalize text-text-tertiary">{garment.category}</span></div></button>)}</div>;
}
