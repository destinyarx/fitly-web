type PageHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: React.ReactNode;
};

export function PageHeader({ actions, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="border-b border-ink/8 bg-surface/75 px-5 py-7 backdrop-blur-xl sm:px-8 lg:px-12 lg:py-9">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-violet uppercase">{eyebrow}</p>
          <h1 className="font-display mt-2 text-4xl leading-none font-extrabold tracking-[-0.05em] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
