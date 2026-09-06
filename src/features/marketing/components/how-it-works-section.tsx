import Image from "next/image";

import { HOW_IT_WORKS_STEPS } from "../marketing.constants";

export function HowItWorksSection() {
  return (
    <section
      id="how"
      className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10 lg:pb-25"
    >
      <div className="max-w-[620px]">
        <p className="font-mono text-xs font-bold tracking-[0.12em] text-violet">
          HOW IT WORKS
        </p>
        <h2 className="font-display mt-3.5 text-[clamp(2rem,4.4vw,46px)] leading-[1.02] font-extrabold tracking-[-0.045em] text-pretty text-ink">
          Three steps, then you just keep trying things on.
        </h2>
      </div>

      <ol className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li
            key={step.number}
            className={`flex min-h-[264px] flex-col rounded-[30px] p-7 shadow-[inset_0_0_0_1.5px_rgba(30,18,51,0.06)] ${step.cardClassName}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-display flex size-11 items-center justify-center rounded-[14px] text-[19px] font-extrabold ${step.chipClassName}`}
              >
                {step.number}
              </span>
              <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-ink/36">
                {step.timing}
              </span>
            </div>

            <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-[20px] bg-ink/5">
              <Image
                src={step.image.src}
                alt={step.image.alt}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>

            <div className="mt-5">
              <h3 className="font-display text-[25px] leading-[1.1] font-bold tracking-[-0.035em] text-pretty text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.5] text-pretty text-text-secondary">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
