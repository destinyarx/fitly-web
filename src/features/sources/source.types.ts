import type { BodyPose, GarmentCategory } from "@/shared/types/domain";

export type BodyTemplate = {
  readonly id: string;
  readonly name: string;
  readonly pose: BodyPose;
  readonly isPrimary: boolean;
  readonly availabilityStatus: "available" | "missing";
  readonly createdAt: string;
};

export type Garment = {
  readonly id: string;
  readonly name: string;
  readonly brand: string | null;
  readonly price: string | null;
  readonly category: GarmentCategory;
  readonly availabilityStatus: "available" | "missing";
  readonly createdAt: string;
};
