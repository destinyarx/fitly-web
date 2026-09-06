import Link from "next/link";

import { FitlyLogo } from "@/shared/components/fitly-logo";

import { NAV_LINKS } from "../marketing.constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/7 bg-surface/86 backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <FitlyLogo />

        <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-semibold text-text-secondary transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink/6"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-linear-150 from-coral to-peach px-5 py-2.5 text-sm font-bold text-surface shadow-[0_12px_24px_-12px_rgba(255,92,138,0.9)] transition-transform hover:-translate-y-px"
          >
            Try it free
          </Link>
        </div>
      </div>
    </header>
  );
}
