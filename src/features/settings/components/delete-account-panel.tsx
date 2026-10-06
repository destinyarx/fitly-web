"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTryOnDraftStore } from "@/features/try-on/stores/try-on-draft.store";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function DeleteAccountPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearDraft = useTryOnDraftStore((state) => state.clear);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [canLeaveDriveFiles, setCanLeaveDriveFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount(leaveDriveFiles: boolean) {
    setIsDeleting(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error: invokeError } = await supabase.functions.invoke("delete-account", {
      body: { leaveDriveFiles },
    });
    if (!invokeError) {
      queryClient.clear();
      clearDraft();
      useTryOnDraftStore.persist.clearStorage();
      router.replace("/");
      router.refresh();
      return;
    }

    const status = invokeError.context instanceof Response
      ? invokeError.context.status
      : undefined;
    setIsDeleting(false);
    if (status === 409) {
      setCanLeaveDriveFiles(true);
      setError("Google Drive access has expired. Reconnect to remove Fitly-created Drive files, or continue and leave those files in your Drive.");
    } else {
      setError("Account deletion stopped before removing your account. Try again.");
    }
  }

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[inset_0_0_0_1.5px_rgba(225,71,127,.14)]">
      <h2 className="font-display text-2xl font-extrabold text-coral-deep">Delete account</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">This permanently deletes your Fitly account, database records, temporary storage, and tracked Fitly-created Drive files. Existing mobile data is deleted too.</p>
      <label className="mt-5 block text-xs font-bold">Type DELETE to confirm<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="field" autoComplete="off" /></label>
      {error ? <p role="alert" className="mt-4 rounded-2xl bg-coral/10 p-4 text-xs leading-5 text-coral-deep">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={confirmation !== "DELETE" || isDeleting} onClick={() => deleteAccount(false)} className="min-h-11 rounded-full bg-coral-deep px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{isDeleting ? "Deleting…" : "Delete everything"}</button>
        {canLeaveDriveFiles ? <button type="button" disabled={isDeleting} onClick={() => deleteAccount(true)} className="min-h-11 rounded-full px-5 text-sm font-bold text-coral-deep shadow-[inset_0_0_0_1.5px_rgba(225,71,127,.3)]">Continue and leave Drive files</button> : null}
      </div>
    </section>
  );
}
