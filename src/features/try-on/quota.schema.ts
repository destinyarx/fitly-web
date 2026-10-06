import { z } from 'zod';

export const quotaSchema = z.object({
  used: z.number().int().nonnegative(),
  limit: z.number().int().min(0).max(3),
  remaining: z.number().int().min(0).max(3),
  resetsAt: z.string().datetime({ offset: true }),
});
export type GenerationQuota = z.infer<typeof quotaSchema>;
export const quotaReachedSchema = z.object({ error: z.literal('daily_cap_reached'), quota: quotaSchema });
export const DAILY_LIMIT_MESSAGE = 'Daily limit reached. You have used all 3 try-ons for today. Your allowance resets at 00:00 UTC.';

export function parseQuotaRow(value: unknown): GenerationQuota {
  const row = z.object({ used_today: z.number().int().nonnegative(), daily_limit: z.number().int().nonnegative(), resets_at: z.string().datetime({ offset: true }) }).parse(value);
  const limit = Math.min(row.daily_limit, 3);
  return { used: row.used_today, limit, remaining: Math.max(0, limit - row.used_today), resetsAt: row.resets_at };
}
