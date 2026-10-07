"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { BODY_POSES } from "@/shared/types/domain";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";
import { ImageDropField } from "./image-drop-field";

const formSchema = z.object({
  image: z.custom<FileList>((value) => value instanceof FileList && value.length === 1, "Choose an image."),
  name: z.string().trim().min(1, "Add a name.").max(80),
  pose: z.enum(BODY_POSES),
});
type FormValues = z.infer<typeof formSchema>;

export function BodyUploadForm({ afterSave = "/try-on/review" }: { readonly afterSave?: string }) {
  const router = useRouter();
  const [entityId] = useState(() => crypto.randomUUID());
  const setBodyTemplateId = useTryOnDraftStore((state) => state.setBodyTemplateId);
  const [serverError, setServerError] = useState<string | null>(null);
  const { formState: { errors, isSubmitting }, handleSubmit, register, control } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { name: "", pose: "full" } });
  const fileName = useWatch({ control, name: "image" })?.item(0)?.name;
  const submit = handleSubmit(async (values) => {
    setServerError(null);
    const image = values.image.item(0);
    if (!image) return;
    const body = new FormData();
    body.set("entityId", entityId);
    body.set("image", image); body.set("name", values.name); body.set("pose", values.pose);
    const response = await fetch("/api/sources/body-templates", { method: "POST", body });
    const result: unknown = await response.json();
    if (!response.ok || typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
      setServerError(response.status === 409 ? "You have reached the five-template limit or Drive needs reconnecting." : "That body template could not be saved."); return;
    }
    setBodyTemplateId(result.id); router.push(afterSave); router.refresh();
  });
  return <form onSubmit={submit} className="space-y-4" noValidate>
    <ImageDropField title="Add a body template" hint="A clear, well-lit photo with your body visible" registration={register("image")} fileName={fileName} error={errors.image?.message} />
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-[12.5px] font-bold text-text-secondary">Template name<input {...register("name")} placeholder="My full-body photo" className="field" />{errors.name ? <span className="mt-1 block text-coral-deep">{errors.name.message}</span> : null}</label><label className="text-[12.5px] font-bold text-text-secondary">Pose<select {...register("pose")} className="field">{BODY_POSES.map((pose) => <option key={pose} value={pose}>{pose === "full" ? "Full body" : "Waist up"}</option>)}</select></label></div>
    {serverError ? <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral-deep">{serverError}</p> : null}
    <button disabled={isSubmitting} className="min-h-12 w-full rounded-full bg-ink px-6 text-[13.5px] font-bold text-surface transition-transform hover:-translate-y-px disabled:opacity-50">{isSubmitting ? "Saving to Drive…" : "Save template & review"}</button>
  </form>;
}
