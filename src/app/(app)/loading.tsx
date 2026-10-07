export default function AppLoading() {
  return (
    <div className="motion-safe:animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="border-b border-ink/8 bg-surface">
        <div className="mx-auto max-w-[1560px] px-5 py-[18px] md:px-7"><div className="h-3 w-20 rounded bg-ink/10" /><div className="mt-3 h-8 w-56 rounded-xl bg-ink/10" /><div className="mt-2 h-3 w-72 max-w-full rounded bg-ink/8" /></div>
      </div>
      <div className="mx-auto grid max-w-[1560px] gap-5 px-5 pt-[22px] md:px-7 lg:grid-cols-[212px_minmax(0,1fr)]">
        <div className="panel hidden h-48 rounded-[22px] lg:block" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"><div className="panel aspect-[4/5]" /><div className="panel aspect-[4/5]" /><div className="panel hidden aspect-[4/5] sm:block" /><div className="panel hidden aspect-[4/5] xl:block" /></div>
      </div>
    </div>
  );
}
