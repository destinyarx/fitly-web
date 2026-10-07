import Link from "next/link";

type PageHeaderProps = {
  readonly crumb: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: React.ReactNode;
};

export function PageHeader({ actions, crumb, description, title }: PageHeaderProps) {
  return (
    <header className="border-b border-ink/8 bg-surface">
      <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-5 py-[18px] sm:flex-row sm:items-end sm:justify-between md:px-7">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-[7px] text-xs font-semibold text-text-on-dark-muted">
            <Link href="/looks" className="text-text-on-dark-muted hover:text-violet">Fitly</Link>
            <span aria-hidden="true">/</span>
            <span className="text-text-secondary">{crumb}</span>
          </nav>
          <h1 className="font-display mt-[5px] text-[31px] leading-[1.05] font-extrabold tracking-[-0.045em] text-ink">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5 sm:pb-1">{actions}</div> : null}
      </div>
    </header>
  );
}
