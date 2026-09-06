export const GARMENT_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "accessory",
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

export const BODY_POSES = ["full", "half"] as const;

export type BodyPose = (typeof BODY_POSES)[number];

export type GarmentSource = "catalogue" | "upload" | "url" | "camera";

export type GenerationStatus =
  | "pending"
  | "queued"
  | "generating"
  | "completed"
  | "failed";

export const GARMENT_CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessory",
};

export const CATEGORY_POSE_RULES: Record<
  GarmentCategory,
  readonly BodyPose[]
> = {
  top: ["full", "half"],
  outerwear: ["full", "half"],
  accessory: ["full", "half"],
  bottom: ["full"],
  dress: ["full"],
  shoes: ["full"],
};

export function isPoseCompatible(
  pose: BodyPose,
  category: GarmentCategory,
): boolean {
  return CATEGORY_POSE_RULES[category].includes(pose);
}

export function getIncompatibilityReason(
  pose: BodyPose,
  category: GarmentCategory,
): string | null {
  if (isPoseCompatible(pose, category)) {
    return null;
  }

  return `${GARMENT_CATEGORY_LABELS[category]} needs a full-body photo`;
}
