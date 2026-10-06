export function ImageLoadingState({ title, description }: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-lilac-soft px-6 text-center text-ink">
      <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-[20px] bg-violet text-3xl text-marigold shadow-sm">
        <span className="motion-safe:animate-pulse">✦</span>
      </div>
      <div>
        <p className="font-display text-xl font-extrabold">{title}</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      <div aria-hidden="true" className="h-1 w-24 overflow-hidden rounded-full bg-violet/10">
        <div className="h-full w-1/2 rounded-full bg-violet motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
