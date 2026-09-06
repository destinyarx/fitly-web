import Link from "next/link";

export function ClosingCtaSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10 lg:pb-25">
      <div className="relative overflow-hidden rounded-[40px] bg-linear-150 from-violet-light to-violet-dark to-72% px-6 py-14 shadow-[0_40px_80px_-40px_rgba(74,42,184,0.9)] sm:px-10 lg:px-15 lg:py-18">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-30 -right-20 size-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(255,224,102,0.3),rgba(255,224,102,0)_70%)]"
        />
        <div className="relative max-w-[620px]">
          <h2 className="font-display text-[clamp(2.1rem,5vw,52px)] leading-[0.98] font-extrabold tracking-[-0.05em] text-pretty text-surface">
            Stop guessing your size. Start seeing it.
          </h2>
          <p className="mt-4.5 text-[17.5px] leading-[1.5] text-surface/74">
            One photo gets you 3 try-ons a day on the free plan. Delete it any
            time and everything goes with it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/sign-up"
              className="inline-flex min-h-14 items-center rounded-full bg-marigold px-7 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Try Fitly free
            </Link>
            <a
              href="#mobile"
              className="inline-flex min-h-14 items-center rounded-full px-6.5 text-base font-bold text-surface shadow-[inset_0_0_0_1.6px_rgba(255,246,236,0.4)] transition-shadow hover:shadow-[inset_0_0_0_1.6px_#FFE066]"
            >
              Get the mobile app
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
