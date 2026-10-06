'use client';

import Image from 'next/image';
import { useState } from 'react';

import { ImageLoadingState } from './image-loading-state';

export function PrivateImage({ alt, id, kind }: { readonly alt: string; readonly id: string; readonly kind: "body-template" | "garment" | "look" }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  return (
    <>
      <Image key={`${id}-${attempt}`} src={`/api/media/${kind}/${id}?attempt=${attempt}`} alt={alt} fill sizes="(max-width: 640px) 100vw, 600px" unoptimized onLoad={() => setState('loaded')} onError={() => setState('failed')} className={`object-cover ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`} />
      {state === 'loading' ? <ImageLoadingState title="Loading your image" description="Fetching your private image. It will appear here when it is ready." /> : null}
      {state === 'failed' ? <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center bg-lilac-soft px-6 text-center"><p className="font-display text-xl font-extrabold text-ink">Image unavailable</p><p className="mt-2 text-sm text-text-secondary">Check your connection or reconnect Google Drive.</p><button type="button" onClick={() => { setState('loading'); setAttempt((value) => value + 1); }} className="mt-4 min-h-11 rounded-full bg-violet px-5 text-sm font-bold text-surface">Retry image</button></div> : null}
    </>
  );
}
