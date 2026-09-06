"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BODY_POSES } from "@/shared/types/domain";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

const formSchema = z.object({
  image: z.custom<FileList>((value) => value instanceof FileList && value.length === 1, "Choose an image."),
  name: z.string().trim().min(1, "Add a name.").max(80),
  pose: z.enum(BODY_POSES),
});
type FormValues = z.infer<typeof formSchema>;

export function BodyUploadForm() {
  const router = useRouter();
  const setBodyTemplateId = useTryOnDraftStore((state) => state.setBodyTemplateId);
  const [serverError, setServerError] = useState<string | null>(null);
  const { formState: { errors, isSubmitting }, handleSubmit, register } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { name: "", pose: "full" } });
  const submit = handleSubmit(async (values) => {
    setServerError(null);
    const image = values.image.item(0);
    if (!image) return;
    const body = new FormData();
    body.set("image", image); body.set("name", values.name); body.set("pose", values.pose);
    const response = await fetch("/api/sources/body-templates", { method: "POST", body });
    const result: unknown = await response.json();
    if (!response.ok || typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
      setServerError(response.status === 409 ? "You have reached the five-template limit or Drive needs reconnecting." : "That body template could not be saved."); return;
    }
    setBodyTemplateId(result.id); router.push("/try-on/review"); router.refresh();
  });
  return <form onSubmit={submit} className="space-y-4" noValidate>
    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-violet/25 bg-lilac-soft/40 p-5 text-center"><span className="font-display text-lg font-bold">Add a body template</span><span className="mt-1 text-xs text-text-secondary">Use a clear, well-lit photo with your body visible.</span><input type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block max-w-full text-xs" {...register("image")} />{errors.image ? <span className="mt-2 text-xs font-bold text-coral-deep">{errors.image.message}</span> : null}</label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Template name<input {...register("name")} placeholder="My full-body photo" className="field" />{errors.name ? <span className="mt-1 block text-coral-deep">{errors.name.message}</span> : null}</label><label className="text-xs font-bold">Pose<select {...register("pose")} className="field">{BODY_POSES.map((pose) => <option key={pose} value={pose}>{pose === "full" ? "Full body" : "Waist up"}</option>)}</select></label></div>
    {serverError ? <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral-deep">{serverError}</p> : null}
    <button disabled={isSubmitting} className="min-h-12 w-full rounded-full bg-ink px-6 text-sm font-bold text-surface disabled:opacity-50">{isSubmitting ? "Saving to Drive…" : "Save template & review"}</button>
  </form>;
}
