import Link from "next/link";

type PrimaryCtaProps = {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
};

/** Coral-to-peach primary action. One per view, per DESIGN.md. */
export function PrimaryCta({ children, className = "", href }: PrimaryCtaProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-linear-150 from-coral to-peach px-7 text-base font-bold tracking-[-0.01em] text-surface shadow-[0_18px_34px_-16px_rgba(255,92,138,0.95)] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </Link>
  );
}
