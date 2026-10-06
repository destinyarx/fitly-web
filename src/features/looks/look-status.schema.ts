import { z } from 'zod';

export const lookStatusSchema = z.object({
  id: z.string().uuid(),
  generation_status: z.enum(['queued', 'generating', 'completed', 'failed']),
  delivery_status: z.enum(['pending', 'delivering', 'delivered', 'failed']),
  failure_reason: z.string().nullable(),
});

export type LookStatus = z.infer<typeof lookStatusSchema>;

export function isLookSettled(status: Pick<LookStatus, 'generation_status' | 'delivery_status'>) {
  return status.generation_status === 'failed' ||
    (status.generation_status === 'completed' &&
      (status.delivery_status === 'delivered' || status.delivery_status === 'failed'));
}
