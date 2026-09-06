import "server-only";

import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user.server";
import { BODY_POSES, GARMENT_CATEGORIES } from "@/shared/types/domain";

import type { BodyTemplate, Garment } from "../source.types";

const availabilitySchema = z.enum(["available", "missing"]);
const bodyRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  pose: z.enum(BODY_POSES),
  is_primary: z.boolean(),
  availability_status: availabilitySchema,
  created_at: z.string(),
});
const garmentRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  brand: z.string().nullable(),
  price: z.string().nullable(),
  category: z.enum(GARMENT_CATEGORIES),
  availability_status: availabilitySchema,
  created_at: z.string(),
});

export async function getBodyTemplates(): Promise<BodyTemplate[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("web_body_templates")
    .select("id,name,pose,is_primary,availability_status,created_at")
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error("body_templates_load_failed");
  return z.array(bodyRowSchema).parse(data).map((row) => ({
    id: row.id,
    name: row.name,
    pose: row.pose,
    isPrimary: row.is_primary,
    availabilityStatus: row.availability_status,
    createdAt: row.created_at,
  }));
}

export async function getGarments(): Promise<Garment[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("web_garments")
    .select("id,name,brand,price,category,availability_status,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("garments_load_failed");
  return z.array(garmentRowSchema).parse(data).map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    category: row.category,
    availabilityStatus: row.availability_status,
    createdAt: row.created_at,
  }));
}
