"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { GARMENT_CATEGORIES, GARMENT_CATEGORY_LABELS } from "@/shared/types/domain";

import { useTryOnDraftStore } from "../stores/try-on-draft.store";
import { ImageDropField } from "./image-drop-field";

const formSchema = z.object({
  image: z.custom<FileList>((value) => value instanceof FileList && value.length === 1, "Choose an image."),
  name: z.string().trim().min(1, "Add a name.").max(80),
  brand: z.string().trim().max(80),
  price: z.string().trim().max(40),
  category: z.enum(GARMENT_CATEGORIES, { error: "Choose a category." }),
});
type FormValues = z.infer<typeof formSchema>;

export function GarmentUploadForm({
  afterSave = "/try-on/body",
  selectForTryOn = true,
}: {
  readonly afterSave?: string;
  readonly selectForTryOn?: boolean;
}) {
  const router = useRouter();
  const [entityId] = useState(() => crypto.randomUUID());
  const setGarmentId = useTryOnDraftStore((state) => state.setGarmentId);
  const [serverError, setServerError] = useState<string | null>(null);
  const { formState: { errors, isSubmitting }, handleSubmit, register, control } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", brand: "", price: "" },
  });

  const fileName = useWatch({ control, name: "image" })?.item(0)?.name;

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    const image = values.image.item(0);
    if (!image) return;
    const body = new FormData();
    body.set("entityId", entityId);
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
    if (selectForTryOn) setGarmentId(result.id);
    router.push(afterSave);
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <ImageDropField title="Drop an image or browse" hint="JPG, PNG or WebP · product-only photos work best" registration={register("image")} fileName={fileName} error={errors.image?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Garment name" error={errors.name?.message}><input {...register("name")} placeholder="e.g. Cropped bomber" className="field" /></Field>
        <Field label="Brand (optional)" error={errors.brand?.message}><input {...register("brand")} placeholder="e.g. COS" className="field" /></Field>
        <Field label="Price (optional)" error={errors.price?.message}><input {...register("price")} placeholder="e.g. $149" className="field" /></Field>
        <Field label="Category" error={errors.category?.message}>
          <select {...register("category")} defaultValue="" className="field"><option value="" disabled>Select a category</option>{GARMENT_CATEGORIES.map((category) => <option key={category} value={category}>{GARMENT_CATEGORY_LABELS[category]}</option>)}</select>
        </Field>
      </div>
      {serverError ? <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral-deep">{serverError}</p> : null}
      <button disabled={isSubmitting} className="min-h-12 w-full rounded-full bg-ink px-6 text-[13.5px] font-bold text-surface transition-transform hover:-translate-y-px disabled:opacity-50">{isSubmitting ? "Saving to Drive…" : selectForTryOn ? "Save garment & choose body" : "Save to Closet"}</button>
    </form>
  );
}

function Field({ children, error, label }: { readonly children: React.ReactNode; readonly error?: string; readonly label: string }) {
  return <label className="block text-[12.5px] font-bold text-text-secondary"><span>{label}</span>{children}{error ? <span className="mt-1 block text-coral-deep">{error}</span> : null}</label>;
}
