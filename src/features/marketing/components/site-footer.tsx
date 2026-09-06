import { FitlyLogo } from "@/shared/components/fitly-logo";

const FOOTER_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#mobile", label: "Mobile app" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Privacy" },
  { href: "#faq", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/8">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-7 px-5 py-11 md:px-10">
        <div className="flex items-center gap-2.5">
          <FitlyLogo size="sm" />
          <span className="ml-2 text-[13px] text-text-tertiary">© 2026</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6.5">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13.5px] font-semibold text-text-tertiary transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
