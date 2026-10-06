"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTryOnDraftStore } from "@/features/try-on/stores/try-on-draft.store";

export function LookActions({
  canUseImage = true,
  canRetryDelivery,
  garmentId,
  isFavorite,
  lookId,
}: {
  readonly canUseImage?: boolean;
  readonly canRetryDelivery: boolean;
  readonly garmentId: string | null;
  readonly isFavorite: boolean;
  readonly lookId: string;
}) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);

  async function retryDelivery() {
    setIsWorking(true);
    const response = await fetch(`/api/looks/${lookId}/retry-delivery`, { method: "POST" });
    setIsWorking(false);
    if (response.ok) router.refresh();
  }

  async function deleteLook() {
    if (!window.confirm("Delete this look from Fitly and Google Drive?")) return;
    setIsWorking(true);
    const response = await fetch(`/api/looks/${lookId}`, { method: "DELETE" });
    if (response.ok) {
      router.replace("/looks");
      router.refresh();
    } else {
      setIsWorking(false);
    }
  }

  async function toggleFavorite() {
    setIsWorking(true);
    const response = await fetch(`/api/looks/${lookId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isFavorite: !isFavorite }),
    });
    setIsWorking(false);
    if (response.ok) router.refresh();
  }

  async function shareLook() {
    const response = await fetch(`/api/media/look/${lookId}`);
    if (!response.ok) return;
    const file = new File([await response.blob()], `fitly-${lookId}.jpg`, {
      type: "image/jpeg",
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Fitly look" });
    } else {
      const link = document.createElement("a");
      link.href = `/api/media/look/${lookId}?download=1`;
      link.click();
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {canUseImage ? <a href={`/api/media/look/${lookId}?download=1`} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-surface">Download image</a> : <button type="button" disabled className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-surface disabled:cursor-not-allowed disabled:opacity-50">Download image</button>}
      <button type="button" onClick={shareLook} disabled={!canUseImage} className="min-h-11 rounded-full px-5 text-sm font-bold shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)] disabled:cursor-not-allowed disabled:opacity-50">Share image</button>
      <button type="button" onClick={toggleFavorite} disabled={isWorking} className="min-h-11 rounded-full px-5 text-sm font-bold shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)]">{isFavorite ? "Unfavorite" : "Favorite"}</button>
      {garmentId ? <button type="button" onClick={() => { setGarmentId(garmentId); router.push("/try-on/body"); }} className="min-h-11 rounded-full px-5 text-sm font-bold shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)]">Try another body</button> : null}
      {canRetryDelivery ? <button type="button" onClick={retryDelivery} disabled={isWorking} className="min-h-11 rounded-full bg-violet px-5 text-sm font-bold text-surface disabled:opacity-50">Retry Drive delivery</button> : null}
      <button type="button" disabled={isWorking} onClick={deleteLook} className="min-h-11 rounded-full px-5 text-sm font-bold text-coral-deep shadow-[inset_0_0_0_1.5px_rgba(225,71,127,.3)] disabled:opacity-50">{isWorking ? "Working…" : "Delete look"}</button>
    </div>
  );
}
