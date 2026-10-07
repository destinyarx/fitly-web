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

  const row = "flex min-h-11 w-full items-center gap-[11px] rounded-2xl px-[13px] text-left text-[13.5px] font-semibold text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";

  return (
    <div className="panel flex flex-col p-2">
      {canRetryDelivery ? <button type="button" onClick={retryDelivery} disabled={isWorking} className={`${row} bg-violet/10 font-bold text-violet`}><ActionIcon path={ICONS.retry} />Retry Drive delivery</button> : null}
      {canUseImage ? <a href={`/api/media/look/${lookId}?download=1`} className={row}><ActionIcon path={ICONS.download} />Download image</a> : <button type="button" disabled className={row}><ActionIcon path={ICONS.download} />Download image</button>}
      <button type="button" onClick={shareLook} disabled={!canUseImage} className={row}><ActionIcon path={ICONS.share} />Share image</button>
      <button type="button" onClick={toggleFavorite} disabled={isWorking} aria-pressed={isFavorite} className={row}><ActionIcon path={ICONS.heart} filled={isFavorite} />{isFavorite ? "Remove from favorites" : "Add to favorites"}</button>
      {garmentId ? <button type="button" onClick={() => { setGarmentId(garmentId); router.push("/try-on/body"); }} className={row}><ActionIcon path={ICONS.body} />Try another body</button> : null}
      <button type="button" disabled={isWorking} onClick={deleteLook} className={`${row} text-coral-deep hover:bg-coral/10`}><ActionIcon path={ICONS.trash} tone="#E1477F" />{isWorking ? "Working…" : "Delete look"}</button>
    </div>
  );
}

const ICONS = {
  retry: "M3.5 9a7.5 7.5 0 0112.6-3.2M18.5 13a7.5 7.5 0 01-12.6 3.2M16.5 2.5V6h-3.5M5.5 19.5V16H9",
  download: "M12 4v10M8 10.4l4 4 4-4M4.5 18.5h15",
  share: "M8.5 13.5l7-4M8.5 10.5l7 4M6 14.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM18 9.9a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8zM18 18.9a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z",
  heart: "M12 20l-1.5-1.3C5.4 14.2 2.5 11.6 2.5 8.4A4.6 4.6 0 0112 6.2a4.6 4.6 0 019.5 2.2c0 3.2-2.9 5.8-8 10.3L12 20z",
  body: "M12 6.4a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM8 22l1.2-7.2L6.2 12V8.6h11.6V12l-3 2.8L16 22",
  trash: "M3.6 5h16.8M9 5V3.6A1.1 1.1 0 0110.1 2.5h3.8A1.1 1.1 0 0115 3.6V5M5.5 6l.9 13.4A1.6 1.6 0 008 21h8a1.6 1.6 0 001.6-1.6L18.5 6",
} as const;

function ActionIcon({ filled = false, path, tone = "#4A2AB8" }: { readonly path: string; readonly filled?: boolean; readonly tone?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
      <path d={path} fill={filled ? "#FF5C8A" : "none"} stroke={filled ? "#FF5C8A" : tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
