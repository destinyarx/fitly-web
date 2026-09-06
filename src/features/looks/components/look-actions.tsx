"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LookActions({
  canRetryDelivery,
  lookId,
}: {
  readonly canRetryDelivery: boolean;
  readonly lookId: string;
}) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

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

  return (
    <div className="flex flex-wrap gap-3">
      <a href={`/api/media/look/${lookId}?download=1`} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-surface">Download image</a>
      {canRetryDelivery ? <button type="button" onClick={retryDelivery} disabled={isWorking} className="min-h-11 rounded-full bg-violet px-5 text-sm font-bold text-surface disabled:opacity-50">Retry Drive delivery</button> : null}
      <button type="button" disabled={isWorking} onClick={deleteLook} className="min-h-11 rounded-full px-5 text-sm font-bold text-coral-deep shadow-[inset_0_0_0_1.5px_rgba(225,71,127,.3)] disabled:opacity-50">{isWorking ? "Working…" : "Delete look"}</button>
    </div>
  );
}
