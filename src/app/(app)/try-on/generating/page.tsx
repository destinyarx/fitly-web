import { redirect } from "next/navigation";
import { z } from "zod";

import { GenerationProgress } from "@/features/try-on/components/generation-progress";

export default async function GeneratingPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const result = z.string().uuid().safeParse((await searchParams).result);
  if (!result.success) redirect("/looks");
  return <GenerationProgress resultId={result.data} />;
}
