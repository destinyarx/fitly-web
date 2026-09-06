import "server-only";

import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user.server";

import type { Look } from "../look.types";

const rowSchema = z.object({
  id: z.string().uuid(),
  generation_status: z.enum(["queued", "generating", "completed", "failed"]),
  delivery_status: z.enum(["pending", "delivering", "delivered", "failed"]),
  is_favorite: z.boolean(),
  garment_snapshots: z.array(z.object({ name: z.string().optional(), category: z.string().optional() })),
  failure_reason: z.string().nullable(),
  created_at: z.string(),
});

export async function getLooks(): Promise<Look[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("web_tryon_results").select("id,generation_status,delivery_status,is_favorite,garment_snapshots,failure_reason,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("looks_load_failed");
  return z.array(rowSchema).parse(data).map((row) => ({
    id: row.id,
    generationStatus: row.generation_status,
    deliveryStatus: row.delivery_status,
    isFavorite: row.is_favorite,
    garmentName: row.garment_snapshots[0]?.name ?? "Untitled garment",
    garmentCategory: row.garment_snapshots[0]?.category ?? "garment",
    failureReason: row.failure_reason,
    createdAt: row.created_at,
  }));
}
