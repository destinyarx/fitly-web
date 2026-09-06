"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type GenerationState = { id: string; generation_status: "queued" | "generating" | "completed" | "failed"; delivery_status: "pending" | "delivering" | "delivered" | "failed"; failure_reason: string | null };

export function GenerationProgress({ resultId }: { readonly resultId: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["looks", "generation", resultId],
    queryFn: async () => { const response = await fetch(`/api/looks/${resultId}`, { cache: "no-store" }); if (!response.ok) throw new Error("status_failed"); return response.json() as Promise<GenerationState>; },
    refetchInterval: (state) => state.state.data?.generation_status === "completed" || state.state.data?.generation_status === "failed" ? false : 2000,
  });
  useEffect(() => { if (query.data?.generation_status === "completed") { const timer = window.setTimeout(() => router.replace(`/looks/${resultId}`), 900); return () => window.clearTimeout(timer); } }, [query.data?.generation_status, resultId, router]);
  const status = query.data?.generation_status ?? "queued";
  return <div className="mx-auto flex min-h-[500px] max-w-2xl flex-col items-center justify-center px-5 text-center"><div className="relative flex size-44 items-center justify-center rounded-full bg-ink-deep shadow-[0_30px_80px_-35px_rgba(30,18,51,.8)]"><span className="animate-pulse text-5xl text-marigold">✦</span><span className="absolute inset-3 animate-spin rounded-full border border-transparent border-t-lilac" /></div><p className="mt-7 text-[10px] font-extrabold tracking-[.16em] text-violet uppercase">{status}</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-.05em]">Fitly is dressing the mirror</h1><p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">You can leave this page. The look keeps generating and will appear in Looks when it is ready.</p>{status === "failed" ? <div className="mt-6 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral-deep">{query.data?.failure_reason ?? "Generation failed. This attempt was not counted."}</div> : null}{query.isError ? <button onClick={() => query.refetch()} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-surface">Retry status check</button> : null}</div>;
}
