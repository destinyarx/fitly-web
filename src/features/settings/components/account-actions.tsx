"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTryOnDraftStore } from "@/features/try-on/stores/try-on-draft.store";

export function AccountActions({ isDriveConnected }: { readonly isDriveConnected: boolean }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearDraft = useTryOnDraftStore((state) => state.clear);
  const [isWorking, setIsWorking] = useState(false);

  async function reconnect() {
    setIsWorking(true);
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        acceptedTerms: true,
        acceptedAiProcessing: true,
        next: "/settings",
      }),
    });
    const result: unknown = await response.json();
    if (
      response.ok &&
      typeof result === "object" &&
      result !== null &&
      "url" in result &&
      typeof result.url === "string"
    ) {
      window.location.assign(result.url);
    } else {
      setIsWorking(false);
    }
  }

  async function signOut() {
    setIsWorking(true);
    await fetch("/api/auth/sign-out", { method: "POST" });
    queryClient.clear();
    clearDraft();
    useTryOnDraftStore.persist.clearStorage();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={reconnect} disabled={isWorking} className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold text-surface disabled:opacity-50">{isWorking ? "Opening Google..." : isDriveConnected ? "Refresh Drive access" : "Reconnect Google Drive"}</button>
      <button type="button" onClick={signOut} disabled={isWorking} className="min-h-11 rounded-full px-5 text-sm font-bold shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)] disabled:opacity-50">Sign out</button>
    </div>
  );
}
