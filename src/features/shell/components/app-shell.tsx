"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FitlyLogo } from "@/shared/components/fitly-logo";

type AppShellProps = {
  readonly children: React.ReactNode;
  readonly displayName: string;
  readonly email: string;
  readonly quota: { readonly used: number; readonly limit: number };
  readonly isDriveConnected: boolean;
};

const NAV_ITEMS = [
  { href: "/looks", label: "Looks", icon: "✦" },
  { href: "/closet", label: "Closet", icon: "▦" },
  { href: "/try-on/garment", label: "Try on", icon: "◉" },
  { href: "/me", label: "Profile", icon: "○" },
] as const;

export function AppShell({
  children,
  displayName,
  email,
  quota,
  isDriveConnected,
}: AppShellProps) {
  const pathname = usePathname();
  const left = Math.max(quota.limit - quota.used, 0);

  return (
    <div className="min-h-dvh bg-[#f4efe7] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-ink-deep px-5 py-6 text-surface lg:flex">
        <FitlyLogo tone="light" />
        <nav className="mt-10 space-y-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition-colors ${
                  isActive ? "bg-surface/14 text-surface" : "text-text-on-dark-muted hover:bg-surface/8 hover:text-surface"
                }`}
              >
                <span className="w-5 text-center text-lg" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[24px] bg-surface/8 p-4">
          <div className="flex items-center justify-between text-[11px] font-extrabold tracking-[0.08em]">
            <span className={left === 0 ? "text-coral" : "text-marigold"}>{left}/{quota.limit} FITS</span>
            <span className="text-surface/45">TODAY</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface/12">
            <div className="h-full rounded-full bg-marigold" style={{ width: `${quota.limit ? (left / quota.limit) * 100 : 0}%` }} />
          </div>
          <p className="mt-4 truncate text-sm font-bold">{displayName}</p>
          <p className="mt-1 truncate text-[11px] text-surface/45">{email}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold ${isDriveConnected ? "text-mint" : "text-coral"}`}>
            <span className="size-1.5 rounded-full bg-current" />
            Drive {isDriveConnected ? "connected" : "needs reconnect"}
          </span>
        </div>
      </aside>

      <main className="min-w-0 pb-24 lg:col-start-2 lg:pb-0">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-[24px] bg-ink-deep p-2 shadow-2xl lg:hidden" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} className={`flex min-h-12 min-w-14 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-bold ${isActive ? "bg-surface/14 text-surface" : "text-text-on-dark-muted"}`}>
              <span className="text-lg leading-none" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
