'use client';

import { useQuery } from '@tanstack/react-query';

import { lookKeys } from '../look.keys';
import { isLookSettled } from '../look-status.schema';
import { getLookStatus } from '../services/look-status';

export function useLookStatus(id: string, hasStoppedWaiting = false) {
  return useQuery({
    queryKey: lookKeys.status(id),
    queryFn: () => getLookStatus(id),
    staleTime: 0,
    retry: 1,
    refetchOnMount: 'always',
    refetchInterval: (query) => hasStoppedWaiting ||
      (query.state.data && isLookSettled(query.state.data)) ? false : 2000,
  });
}
