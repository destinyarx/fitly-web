import Link from "next/link";

type AppLinkProps = {
  readonly children: React.ReactNode;
  readonly href: string;
  readonly variant?: "solid" | "ghost" | "violet";
};

const VARIANTS = {
  solid: "bg-ink text-surface",
  ghost: "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)] hover:text-violet hover:shadow-[inset_0_0_0_1.5px_#4A2AB8]",
  violet: "bg-violet text-surface",
} as const;

export function AppLink({ children, href, variant = "solid" }: AppLinkProps) {
  return <Link href={href} className={`inline-flex min-h-11 flex-none items-center justify-center gap-2 rounded-full px-[18px] text-[13.5px] font-bold whitespace-nowrap transition-transform hover:-translate-y-px ${VARIANTS[variant]}`}>{children}</Link>;
}
