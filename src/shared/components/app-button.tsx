import Link from "next/link";

export function AppLink({ children, href, secondary = false }: { readonly children: React.ReactNode; readonly href: string; readonly secondary?: boolean }) {
  return <Link href={href} className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold transition-transform hover:-translate-y-px ${secondary ? "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_rgba(30,18,51,.16)]" : "bg-ink text-surface shadow-[0_14px_24px_-16px_rgba(30,18,51,.8)]"}`}>{children}</Link>;
}
