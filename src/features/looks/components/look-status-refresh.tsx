'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLookStatus } from '../hooks/use-look-status';
import type { Look } from '../look.types';

export function LookStatusRefresh({ look }: { readonly look: Look }) {
  const router = useRouter();
  const query = useLookStatus(look.id);
  const status = query.data;
  useEffect(() => {
    if (status && (status.generation_status !== look.generationStatus ||
      status.delivery_status !== look.deliveryStatus)) router.refresh();
  }, [status, look.generationStatus, look.deliveryStatus, router]);

  return query.isError ? (
    <div role="alert" className="mt-4 rounded-2xl bg-coral/10 p-4 text-sm text-coral-deep">
      Status updates are unavailable. Your look continues processing.
      <button type="button" onClick={() => query.refetch()} className="mt-2 block min-h-11 font-bold text-violet">Retry status check</button>
    </div>
  ) : null;
}
