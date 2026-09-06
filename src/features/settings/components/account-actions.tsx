"use client";

import { useState } from "react";

export function AccountActions({ isDriveConnected }: { readonly isDriveConnected: boolean }) {
  const [isWorking, setIsWorking] = useState(false);
  async function reconnect() {
    setIsWorking(true);
    const response = await fetch("/api/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ acceptsTerms: true, acceptsAiProcessing: true, next: "/settings" }) });
    const result: unknown = await response.json();
    if (response.ok && typeof result === "object" && result !== null && "url" in result && typeof result.url === "string") window.location.assign(result.url);
    else setIsWorking(false);
  }
  return <div className="flex flex-wrap gap-3"><button onClick={reconnect} disabled={isWorking} className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-surface disabled:opacity-50">{isWorking ? "Opening Google…" : isDriveConnected ? "Refresh Drive access" : "Reconnect Google Drive"}</button><form action="/api/auth/sign-out" method="post"><button className="min-h-11 rounded-full px-5 text-sm font-bold shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)]">Sign out</button></form></div>;
}
