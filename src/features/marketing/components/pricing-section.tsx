import Link from "next/link";

import { CheckIcon, LockIcon } from "@/shared/components/icons";

import { PRICING_PLANS } from "../marketing.constants";
import type { PricingPlan } from "../marketing.constants";

type PlanTheme = {
  readonly card: string;
  readonly title: string;
  readonly muted: string;
  readonly tick: string;
  readonly button: string;
  readonly badge: string;
};

const THEMES: Record<PricingPlan["tone"], PlanTheme> = {
  light: {
    card: "bg-surface-raised shadow-[inset_0_0_0_1.5px_rgba(30,18,51,0.1)]",
    title: "text-ink",
    muted: "text-text-secondary",
    tick: "#4A2AB8",
    button: "bg-ink text-surface",
    badge: "bg-ink/8 text-ink/55",
  },
  dark: {
    card: "bg-ink shadow-[0_30px_60px_-30px_rgba(30,18,51,0.7)]",
    title: "text-surface",
    muted: "text-surface/66",
    tick: "#FFE066",
    button: "bg-marigold text-ink",
    badge: "bg-surface/14 text-surface/72",
  },
};

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10 lg:pb-25"
    >
      <div className="mx-auto max-w-[560px] text-center">
        <p className="inline-block rounded-full bg-violet/10 px-4 py-[7px] font-mono text-[15px] font-extrabold tracking-[0.14em] text-violet">
          PRICING
        </p>
        <h2 className="font-display mt-3.5 text-[clamp(2rem,4.4vw,46px)] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink">
          Start free. Upgrade when you&apos;re hooked.
        </h2>
      </div>

      <ul className="mt-11 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const theme = THEMES[plan.tone];

          return (
            <li key={plan.name} className="flex">
              <article
                className={`relative flex w-full flex-col rounded-[32px] p-8 ${theme.card} ${
                  plan.isLocked ? "opacity-85" : ""
                }`}
              >
                {plan.isLocked ? (
                  <p
                    className={`absolute top-6 right-6 flex items-center gap-1.5 rounded-full px-3 py-[5px] font-mono text-[10px] font-extrabold tracking-[0.09em] ${theme.badge}`}
                  >
                    <LockIcon
                      width={9}
                      height={11}
                      fill="currentColor"
                    />
                    SOON
                  </p>
                ) : null}

                <h3
                  className={`text-[14.5px] font-bold tracking-[-0.01em] ${theme.muted}`}
                >
                  {plan.name}
                </h3>
                <p className="mt-3.5 flex items-baseline gap-1.5">
                  <span
                    className={`font-display text-[46px] leading-none font-extrabold tracking-[-0.05em] ${theme.title}`}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-sm font-semibold ${theme.muted}`}>
                    {plan.per}
                  </span>
                </p>
                <p
                  className={`mt-2.5 min-h-[42px] text-[14.5px] leading-[1.45] text-pretty ${theme.muted}`}
                >
                  {plan.blurb}
                </p>

                {plan.isLocked ? (
                  <>
                    <p
                      className={`mt-6 flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-bold ${theme.badge}`}
                    >
                      <LockIcon fill="currentColor" />
                      <span>{plan.cta}</span>
                    </p>
                    <p
                      className={`mt-2.5 text-center text-[12.5px] font-semibold ${theme.muted}`}
                    >
                      Free plan only during early access
                    </p>
                  </>
                ) : (
                  <Link
                    href="/sign-up"
                    className={`mt-6 flex min-h-14 items-center justify-center rounded-full px-4 text-[15px] font-bold transition-transform hover:-translate-y-px ${theme.button}`}
                  >
                    {plan.cta}
                  </Link>
                )}

                <ul className="mt-6.5 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="mt-[3px] flex-none">
                        <CheckIcon size={14} stroke={theme.tick} />
                      </span>
                      <span
                        className={`text-sm leading-[1.4] ${theme.muted}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
