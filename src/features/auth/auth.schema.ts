import { z } from "zod";

export const startGoogleAuthSchema = z.object({
  acceptedTerms: z.literal(true),
  acceptedAiProcessing: z.literal(true),
  next: z
    .string()
    .startsWith("/")
    .refine((value) => !value.startsWith("//"), "Use a relative application path"),
});

export type StartGoogleAuthInput = z.infer<typeof startGoogleAuthSchema>;
