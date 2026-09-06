import { FitlyMark } from "@/shared/components/fitly-mark";
import { CheckIcon } from "@/shared/components/icons";
import { PrimaryCta } from "@/shared/components/primary-cta";

import { MIRROR_FEATURES } from "../marketing.constants";

export function MirrorSection() {
  return (
    <section id="mirror" className="bg-ink py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 md:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.12em] text-marigold">
            THE MIRROR
          </p>
          <h2 className="font-display mt-3.5 text-[clamp(2rem,4.6vw,48px)] leading-none font-extrabold tracking-[-0.045em] text-pretty text-surface">
            One body template. Any garment. A real try-on.
          </h2>
          <p className="mt-5 max-w-[460px] text-[17px] leading-[1.55] text-pretty text-surface/66">
            Fitly does one thing and does it well: it takes the body template
            you saved and the garment you picked, and generates you wearing it.
            No styling opinions, no guesswork — just the image.
          </p>

          <ul className="mt-7 flex flex-col gap-3.5">
            {MIRROR_FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3.5">
                <span className="flex size-[26px] flex-none items-center justify-center rounded-lg bg-marigold/16">
                  <CheckIcon stroke="#FFE066" />
                </span>
                <span className="block">
                  <span className="block text-[15.5px] font-bold tracking-[-0.02em] text-surface">
                    {feature.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-[1.45] text-surface/55">
                    {feature.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <MirrorStage />
      </div>
    </section>
  );
}

function MirrorStage() {
  return (
    <div className="relative h-[520px] overflow-hidden rounded-[34px] bg-[radial-gradient(115%_70%_at_50%_30%,#3A2A5E,#241844_50%,#140C28)] shadow-[0_40px_80px_-34px_rgba(0,0,0,0.8)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[repeating-linear-gradient(110deg,rgba(255,255,255,0.03)_0_3px,rgba(255,255,255,0)_3px_10px)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-50 bg-linear-to-b from-lilac/16 to-transparent motion-safe:animate-sweep-y"
      />

      <div className="absolute inset-x-5.5 top-5.5 flex items-center justify-between gap-3">
        <div
          aria-hidden="true"
          className="flex rounded-full bg-surface/14 p-[3px] backdrop-blur-[10px]"
        >
          <span className="rounded-full bg-surface px-4 py-2 text-[12.5px] font-bold text-ink">
            Full body
          </span>
          <span className="rounded-full px-4 py-2 text-[12.5px] font-bold text-surface/70">
            Waist up
          </span>
        </div>
        <span className="rounded-full bg-surface/14 px-3 py-[7px] font-mono text-[10px] font-bold tracking-[0.1em] text-surface/80 backdrop-blur-[10px]">
          LIVE PREVIEW
        </span>
      </div>

      <p className="absolute inset-x-5.5 top-20.5 flex items-start gap-3 rounded-[22px_22px_22px_8px] bg-surface/95 px-4 py-3.5 shadow-[0_18px_34px_-18px_rgba(0,0,0,0.8)] backdrop-blur-[12px]">
        <span className="flex size-[27px] flex-none items-center justify-center rounded-lg bg-linear-150 from-violet-light to-violet-dark to-70%">
          <FitlyMark size={17} />
        </span>
        <span className="flex-1 text-[13.5px] leading-[1.4] text-ink">
          Upload a full-body shot and I&apos;ll keep it as your mirror — you
          only do this once.
        </span>
      </p>

      <div
        aria-hidden="true"
        className="absolute top-49 left-1/2 h-66 w-[214px] -translate-x-1/2"
      >
        <div className="absolute -inset-4.5 rounded-[120px_120px_46px_46px] bg-[radial-gradient(60%_50%_at_50%_20%,rgba(217,198,255,0.16),rgba(217,198,255,0)_70%)]" />
        <div className="absolute top-0 left-1/2 size-[70px] -translate-x-1/2 rounded-full border-[1.5px] border-dashed border-surface/60" />
        <div className="absolute top-20 left-1/2 h-46 w-43 -translate-x-1/2 rounded-[66px_66px_30px_30px] border-[1.5px] border-dashed border-surface/60" />
        <div className="absolute -top-4.5 -left-4.5 size-[30px] rounded-tl-xl border-t-[2.5px] border-l-[2.5px] border-marigold" />
        <div className="absolute -top-4.5 -right-4.5 size-[30px] rounded-tr-xl border-t-[2.5px] border-r-[2.5px] border-marigold" />
        <div className="absolute -bottom-4.5 -left-4.5 size-[30px] rounded-bl-xl border-b-[2.5px] border-l-[2.5px] border-marigold" />
        <div className="absolute -right-4.5 -bottom-4.5 size-[30px] rounded-br-xl border-r-[2.5px] border-b-[2.5px] border-marigold" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-ink-deep/85 to-46% px-6.5 pb-6.5">
        <p className="mb-4 flex justify-center">
          <span className="flex items-center gap-2.5 rounded-full bg-surface/12 px-4 py-2 backdrop-blur-[10px]">
            <span
              aria-hidden="true"
              className="size-[22px] rounded-md bg-linear-150 from-violet-light to-violet-dark"
            />
            <span className="text-[12.5px] font-semibold text-surface/84">
              Trying: Cropped bomber
            </span>
          </span>
        </p>
        <div className="flex items-center justify-center">
          <PrimaryCta href="/sign-up" className="text-[15px]">
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M9 12.5V3.5M5.6 6.6L9 3.2l3.4 3.4"
                fill="none"
                stroke="#FFF6EC"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 12v2.2A1.8 1.8 0 004.8 16h8.4A1.8 1.8 0 0015 14.2V12"
                fill="none"
                stroke="#FFF6EC"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span>Upload &amp; generate</span>
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}
