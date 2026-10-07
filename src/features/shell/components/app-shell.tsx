"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useTryOnDraftStore } from "@/features/try-on/stores/try-on-draft.store";
import { FitlyLogo } from "@/shared/components/fitly-logo";

type AppShellProps = {
  readonly children: React.ReactNode;
  readonly displayName: string;
  readonly email: string;
  readonly quota: { readonly used: number; readonly limit: number };
  readonly isDriveConnected: boolean;
  readonly userId: string;
};

const NAV_ITEMS = [
  { href: "/try-on/garment", match: "/try-on", label: "Mirror", icon: "M12 3.2c-3.9 0-6.8 3.5-6.8 7.9s2.9 7.9 6.8 7.9 6.8-3.5 6.8-7.9S15.9 3.2 12 3.2zM9.6 21h4.8" },
  { href: "/looks", match: "/looks", label: "Looks", icon: "M4 4.8h6.2v6.2H4zM13.8 4.8H20v6.2h-6.2zM4 13h6.2v6.2H4zM13.8 13H20v6.2h-6.2z" },
  { href: "/closet", match: "/closet", label: "Closet", icon: "M5 4h5.2v16H5zM13.8 4H19v16h-5.2M8.6 11.4h.8M15.4 11.4h.8" },
  { href: "/me", match: "/me", label: "Profile", icon: "M12 11.6a3.8 3.8 0 100-7.6 3.8 3.8 0 000 7.6zM4.6 20c1.5-3.3 4.2-4.9 7.4-4.9s5.9 1.6 7.4 4.9" },
] as const;

function isActive(pathname: string, match: string) {
  if (match === "/me" && pathname.startsWith("/settings")) return true;
  return pathname === match || pathname.startsWith(`${match}/`);
}

function NavIcon({ path, size = 16 }: { readonly path: string; readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppShell({
  children,
  displayName,
  email,
  quota,
  isDriveConnected,
  userId,
}: AppShellProps) {
  const pathname = usePathname();
  const claimDraft = useTryOnDraftStore((state) => state.claimForUser);
  useEffect(() => claimDraft(userId), [claimDraft, userId]);
  const left = Math.max(quota.limit - quota.used, 0);
  const fraction = quota.limit ? Math.min(left / quota.limit, 1) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-40 bg-ink">
        <div className="mx-auto flex min-h-[66px] max-w-[1560px] items-center gap-4 px-5 py-2.5 md:px-7">
          <FitlyLogo tone="light" size="sm" />

          {!isDriveConnected ? (
            <Link href="/me?tab=account" className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-coral/15 px-3 text-[11px] font-bold text-coral">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Drive needs reconnect
            </Link>
          ) : null}

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-[3px] rounded-full bg-surface/8 p-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold tracking-[-0.015em] whitespace-nowrap transition-colors ${
                    active ? "bg-surface/16 text-surface" : "text-text-on-dark-muted hover:bg-surface/12 hover:text-surface"
                  }`}
                >
                  <NavIcon path={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/me"
            title={`${displayName} · ${email}`}
            aria-label={`Profile for ${displayName}. ${left} of ${quota.limit} try-ons left today.`}
            className="ml-auto flex flex-none flex-col items-center gap-[5px] md:ml-0"
          >
            <span
              className="flex size-[50px] items-center justify-center rounded-full transition-transform hover:-translate-y-px"
              style={{ background: `conic-gradient(from -90deg, #FFE066 0turn ${fraction}turn, rgba(255,246,236,.16) ${fraction}turn 1turn)` }}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-ink">
                <span className="font-display flex size-[34px] items-center justify-center rounded-full bg-linear-140 from-peach-soft to-lilac text-sm font-extrabold text-ink">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </span>
            </span>
            <span className={`font-mono text-[9px] font-extrabold tracking-[0.07em] whitespace-nowrap ${left === 0 ? "text-coral" : "text-marigold"}`}>
              {left}/{quota.limit} FITS
            </span>
          </Link>
        </div>
      </header>

      <main className="w-full min-w-0 flex-1 pb-28 md:pb-0">{children}</main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-around rounded-[24px] bg-ink p-2 shadow-[0_20px_40px_-20px_rgba(30,18,51,.8)] md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-bold ${
                item.match === "/try-on"
                  ? active ? "bg-linear-150 from-coral to-peach text-surface" : "text-coral"
                  : active ? "bg-surface/14 text-surface" : "text-text-on-dark-muted"
              }`}
            >
              <NavIcon path={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
