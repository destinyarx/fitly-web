'use client';

import { useQuery } from '@tanstack/react-query';

import type { GenerationQuota } from '../quota.schema';
import { getGenerationQuota } from '../services/quota';
import { tryOnKeys } from '../try-on.keys';

export function useGenerationQuota(initialQuota: GenerationQuota | null) {
  return useQuery({ queryKey: tryOnKeys.quota, queryFn: getGenerationQuota, initialData: initialQuota ?? undefined, staleTime: 0, retry: 1, refetchOnMount: 'always', refetchInterval: 15000 });
}
