import Link from "next/link";

type RailItem = {
  readonly href: string;
  readonly label: string;
  readonly isActive: boolean;
  readonly count?: number;
  readonly icon?: string;
};

/** Sticky rail of filter or tab links. Scrolls horizontally on phones. */
export function SideRail({ items, label, title }: { readonly items: readonly RailItem[]; readonly label: string; readonly title?: string }) {
  return (
    <nav aria-label={label} className="panel rounded-[22px] p-2">
      {title ? <p className="eyebrow hidden px-3 pt-2.5 pb-1.5 lg:block">{title}</p> : null}
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => (
          <li key={item.href} className="flex-none">
            <Link
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2.5 rounded-[14px] px-3 text-[13.5px] whitespace-nowrap transition-colors hover:bg-ink/5 ${
                item.isActive ? "bg-violet/11 font-bold text-violet" : "font-semibold text-[#5C5470]"
              }`}
            >
              {item.icon ? (
                <svg width="15" height="15" viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
                  <path d={item.icon} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              <span className="flex-1">{item.label}</span>
              {item.count === undefined ? null : (
                <span className={`text-xs font-semibold ${item.isActive ? "text-violet" : "text-text-on-dark-muted"}`}>{item.count}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
