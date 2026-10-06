import { lookStatusSchema } from '../look-status.schema';

export async function getLookStatus(id: string) {
  const response = await fetch(`/api/looks/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('status_failed');
  return lookStatusSchema.parse(await response.json());
}
