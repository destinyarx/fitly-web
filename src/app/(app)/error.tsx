"use client";

export default function AppError({ reset }: { readonly reset: () => void }) {
  return <div className="flex min-h-[70dvh] flex-col items-center justify-center p-6 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-coral/10 text-2xl font-bold text-coral-deep">!</span><h1 className="font-display mt-5 text-3xl font-extrabold">This view could not load</h1><p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">Check your connection and Supabase setup, then try again.</p><button onClick={reset} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-surface">Try again</button></div>;
}
