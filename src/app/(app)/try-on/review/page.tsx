import { getBodyTemplates, getGarments } from "@/features/sources";
import { ReviewDraft } from "@/features/try-on/components/review-draft";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/shared/components/page-header";

export default async function ReviewStepPage() {
  const supabase = await createServerSupabaseClient();
  const [templates, garments, quotaResult] = await Promise.all([
    getBodyTemplates(),
    getGarments(),
    supabase.rpc("get_my_generation_quota"),
  ]);
  const quotaRow = Array.isArray(quotaResult.data) ? quotaResult.data[0] : undefined;
  const quota = {
    used: typeof quotaRow?.used_today === "number" ? quotaRow.used_today : 0,
    limit: typeof quotaRow?.daily_limit === "number" ? quotaRow.daily_limit : 3,
  };

  return (
    <>
      <PageHeader eyebrow="Step 3 of 3" title="Check the mirror" description="Confirm the exact body template and garment before using one daily try-on." />
      <div className="mx-auto max-w-[850px] px-5 py-8 sm:px-8 lg:px-12"><ReviewDraft templates={templates} garments={garments} quota={quota} /></div>
    </>
  );
}
