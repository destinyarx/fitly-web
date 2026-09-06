"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GARMENT_CATEGORIES, GARMENT_CATEGORY_LABELS } from "@/shared/types/domain";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";

const formSchema = z.object({
  image: z.custom<FileList>((value) => value instanceof FileList && value.length === 1, "Choose an image."),
  name: z.string().trim().min(1, "Add a name.").max(80),
  brand: z.string().trim().max(80),
  price: z.string().trim().max(40),
  category: z.enum(GARMENT_CATEGORIES, { error: "Choose a category." }),
});
type FormValues = z.infer<typeof formSchema>;

export function GarmentUploadForm() {
  const router = useRouter();
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  const [serverError, setServerError] = useState<string | null>(null);
  const { formState: { errors, isSubmitting }, handleSubmit, register } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", brand: "", price: "" },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    const image = values.image.item(0);
    if (!image) return;
    const body = new FormData();
    body.set("image", image);
    body.set("name", values.name);
    body.set("brand", values.brand);
    body.set("price", values.price);
    body.set("category", values.category);
    const response = await fetch("/api/sources/garments", { method: "POST", body });
    const result: unknown = await response.json();
    if (!response.ok || typeof result !== "object" || result === null || !("id" in result) || typeof result.id !== "string") {
      setServerError(response.status === 409 ? "Reconnect Google Drive, then try again." : "That garment could not be saved. Try another image.");
      return;
    }
    setGarmentId(result.id);
    router.push("/try-on/body");
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <label className="group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-violet/25 bg-lilac-soft/40 px-5 text-center transition-colors hover:border-violet/55">
        <span className="font-display text-xl font-bold">Drop a garment photo here</span>
        <span className="mt-2 text-xs leading-5 text-text-secondary">JPG, PNG or WebP. Product-only photos work best.</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-4 block max-w-full text-xs" {...register("image")} />
        {errors.image ? <span className="mt-2 text-xs font-bold text-coral-deep">{errors.image.message}</span> : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Garment name" error={errors.name?.message}><input {...register("name")} placeholder="e.g. Cropped bomber" className="field" /></Field>
        <Field label="Brand (optional)" error={errors.brand?.message}><input {...register("brand")} placeholder="e.g. COS" className="field" /></Field>
        <Field label="Price (optional)" error={errors.price?.message}><input {...register("price")} placeholder="e.g. $149" className="field" /></Field>
        <Field label="Category" error={errors.category?.message}>
          <select {...register("category")} defaultValue="" className="field"><option value="" disabled>Select a category</option>{GARMENT_CATEGORIES.map((category) => <option key={category} value={category}>{GARMENT_CATEGORY_LABELS[category]}</option>)}</select>
        </Field>
      </div>
      {serverError ? <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral-deep">{serverError}</p> : null}
      <button disabled={isSubmitting} className="min-h-12 w-full rounded-full bg-ink px-6 text-sm font-bold text-surface disabled:opacity-50">{isSubmitting ? "Saving to Drive…" : "Save garment & choose body"}</button>
    </form>
  );
}

function Field({ children, error, label }: { readonly children: React.ReactNode; readonly error?: string; readonly label: string }) {
  return <label className="block text-xs font-bold text-ink"><span>{label}</span>{children}{error ? <span className="mt-1 block text-coral-deep">{error}</span> : null}</label>;
}
