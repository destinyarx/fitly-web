export type Look = {
  readonly id: string;
  readonly generationStatus: "queued" | "generating" | "completed" | "failed";
  readonly deliveryStatus: "pending" | "delivering" | "delivered" | "failed";
  readonly isFavorite: boolean;
  readonly garmentName: string;
  readonly garmentCategory: string;
  readonly failureReason: string | null;
  readonly createdAt: string;
};
