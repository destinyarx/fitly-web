import { quotaSchema } from '../quota.schema';

export async function getGenerationQuota() {
  const response = await fetch('/api/try-on/quota', { cache: 'no-store' });
  if (!response.ok) throw new Error('quota_unavailable');
  return quotaSchema.parse(await response.json());
}
