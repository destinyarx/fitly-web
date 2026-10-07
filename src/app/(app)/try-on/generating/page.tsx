import { redirect } from "next/navigation";
import { z } from "zod";

import { GenerationProgress } from "@/features/try-on/components/generation-progress";
import { PageHeader } from "@/shared/components/page-header";

export default async function GeneratingPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const result = z.string().uuid().safeParse((await searchParams).result);
  if (!result.success) redirect("/looks");
  return (
    <>
      <PageHeader crumb="Mirror" title="Try-on studio" description="Your look is being generated from your selected body template and garment." />
      <div className="mx-auto w-full max-w-[1560px] px-5 pt-[22px] pb-[60px] md:px-7"><GenerationProgress resultId={result.data} /></div>
    </>
  );
}
