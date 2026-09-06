import { FAQS } from "../marketing.constants";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-[900px] px-5 pb-20 md:px-10 lg:pb-25"
    >
      <h2 className="font-display text-center text-[clamp(1.9rem,4vw,42px)] leading-[1.04] font-extrabold tracking-[-0.045em] text-ink">
        Questions, answered honestly
      </h2>

      {/* ponytail: native <details name> gives exclusive accordion behavior,
          keyboard support and focus for free — no client component. */}
      <div className="mt-9 flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            name="fitly-faq"
            className="group rounded-3xl px-6.5 py-5.5 shadow-[inset_0_0_0_1.5px_rgba(30,18,51,0.08)] open:bg-surface-raised"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 [&::-webkit-details-marker]:hidden">
              <span className="text-[17px] font-bold tracking-[-0.025em] text-ink">
                {faq.question}
              </span>
              <span
                aria-hidden="true"
                className="flex size-[26px] flex-none items-center justify-center rounded-full bg-ink/7 font-mono text-[15px] font-extrabold text-ink group-open:bg-marigold"
              >
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">–</span>
              </span>
            </summary>
            <p className="mt-3 max-w-[660px] text-[15px] leading-[1.55] text-pretty text-text-secondary">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
