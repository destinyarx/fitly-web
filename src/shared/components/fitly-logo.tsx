import Link from "next/link";

import { FitlyMark } from "./fitly-mark";

type FitlyLogoProps = {
  readonly tone?: "dark" | "light";
  readonly size?: "sm" | "md";
};

const TILE = {
  sm: "size-[30px] rounded-[9px]",
  md: "size-9 rounded-[10px]",
} as const;

const WORDMARK = {
  sm: "text-[19px]",
  md: "text-[25px]",
} as const;

export function FitlyLogo({ size = "md", tone = "dark" }: FitlyLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`${TILE[size]} flex items-center justify-center bg-linear-150 from-violet-light to-violet-dark to-70%`}
      >
        <FitlyMark size={size === "sm" ? 18 : 22} />
      </span>
      <span
        className={`font-display ${WORDMARK[size]} font-extrabold tracking-[-0.045em] ${
          tone === "light" ? "text-surface" : "text-ink"
        }`}
      >
        Fitly
      </span>
    </Link>
  );
}
