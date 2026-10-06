import 'server-only';

import { requireUser } from '@/lib/auth/require-user.server';

import { parseQuotaRow } from '../quota.schema';

export async function getGenerationQuota() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc('get_my_generation_quota');
  if (error) throw new Error('quota_unavailable');
  return parseQuotaRow(Array.isArray(data) ? data[0] : null);
}
