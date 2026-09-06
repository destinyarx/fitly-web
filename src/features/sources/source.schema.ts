import { z } from "zod";

import { BODY_POSES, GARMENT_CATEGORIES } from "@/shared/types/domain";

export const garmentMetadataSchema = z.object({
  name: z.string().trim().min(1).max(80),
  brand: z.string().trim().max(80).optional(),
  price: z.string().trim().max(40).optional(),
  category: z.enum(GARMENT_CATEGORIES),
});

export const bodyTemplateMetadataSchema = z.object({
  name: z.string().trim().min(1).max(80),
  pose: z.enum(BODY_POSES),
});
