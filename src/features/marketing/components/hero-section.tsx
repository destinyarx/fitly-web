import Image from "next/image";
import Link from "next/link";

import { PrimaryCta } from "@/shared/components/primary-cta";

const AVATAR_GRADIENTS = [
  "from-peach-soft to-lilac",
  "from-lilac to-violet-light",
  "from-peach to-coral",
  "from-marigold to-peach",
] as const;

export function HeroSection() {
  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-35 hidden size-[620px] rounded-full bg-[radial-gradient(circle_at_38%_36%,#D9C6FF,#F3E2FF_58%,rgba(255,246,236,0)_72%)] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-75 -left-50 hidden size-[460px] rounded-full bg-[radial-gradient(circle_at_60%_40%,#FFD9C2,rgba(255,246,236,0)_70%)] lg:block"
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 pt-14 pb-20 md:px-10 lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:pt-19 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full bg-surface-raised py-[7px] pr-3.5 pl-2 shadow-[0_2px_8px_rgba(30,18,51,0.07)]">
            <span className="flex size-[22px] items-center justify-center rounded-md bg-marigold">
              <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M9 1L4.5 8.5h3L7 15l4.5-7.5h-3L9 1z" fill="#4A2AB8" />
              </svg>
            </span>
            <span className="text-[12.5px] font-bold tracking-[-0.01em] text-ink">
              One photo. Every fit. About 20 seconds.
            </span>
          </p>

          <h1 className="font-display mt-5 text-[clamp(2.8rem,7.2vw,74px)] leading-[0.94] font-extrabold tracking-[-0.05em] text-pretty text-ink">
            Mirror, mirror —<br />
            see it on <span className="text-violet">you</span>
            <br />
            before you buy.
          </h1>

          <p className="mt-5 max-w-[480px] text-[17.5px] leading-[1.52] text-pretty text-text-secondary">
            Fitly is a virtual try-on mirror for your real body. Upload one
            photo, paste any product link, and watch the piece land on you —
            drape, length, proportion and all.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <PrimaryCta href="/sign-up">
              <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M10 2.5c3.6 0 6.4 3.4 6.4 7.5S13.6 17.5 10 17.5 3.6 14.1 3.6 10 6.4 2.5 10 2.5z"
                  fill="none"
                  stroke="#FFF6EC"
                  strokeWidth="1.7"
                />
                <path
                  d="M10 6.2c1.5 0 2.7 1.7 2.7 3.8"
                  fill="none"
                  stroke="#FFF6EC"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <span>Step into the mirror</span>
            </PrimaryCta>
            <Link
              href="#mirror"
              className="inline-flex min-h-14 items-center rounded-full px-6 text-base font-bold text-ink shadow-[inset_0_0_0_1.6px_rgba(30,18,51,0.18)] transition-colors hover:text-violet hover:shadow-[inset_0_0_0_1.6px_#4A2AB8]"
            >
              Watch a try-on
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span aria-hidden="true" className="flex">
              {AVATAR_GRADIENTS.map((gradient, index) => (
                <span
                  key={gradient}
                  className={`size-8 rounded-full bg-linear-140 ${gradient} shadow-[0_0_0_2.5px_#FFF6EC] ${
                    index > 0 ? "-ml-2.5" : ""
                  }`}
                />
              ))}
            </span>
            <span className="text-[13.5px] font-semibold text-text-tertiary">
              Free forever plan · no card · your photos stay private
            </span>
          </div>
        </div>

        <HeroTryOnCollage />
      </div>
    </section>
  );
}

function HeroTryOnCollage() {
  return (
    <div className="relative">
      <div className="relative grid grid-cols-[34%_66%] gap-2.5 rounded-[34px] bg-surface-raised/66 p-2.5 shadow-[0_40px_80px_-40px_rgba(30,18,51,0.5)] backdrop-blur-[8px]">
        <div className="relative flex min-w-0 flex-col gap-2.5">
          <figure className="relative aspect-3/4 overflow-hidden rounded-[26px_8px_8px_8px] bg-[#EDEAE4]">
            <Image
              src="/landing/before.png"
              alt="A saved full-body photo used as a Fitly body template"
              fill
              sizes="(min-width: 1024px) 200px, 34vw"
              className="object-cover"
              loading="eager"
            />
            <figcaption className="absolute top-2.5 left-2.5 rounded-full bg-ink/76 px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.09em] text-surface">
              HER PHOTO
            </figcaption>
          </figure>
          <figure className="relative aspect-3/4 overflow-hidden rounded-[8px_8px_8px_26px] bg-[#EDEAE4]">
            <Image
              src="/landing/garment.png"
              alt="A cropped bomber jacket product photo"
              fill
              sizes="(min-width: 1024px) 200px, 34vw"
              className="object-cover"
            />
            <figcaption className="absolute top-2.5 left-2.5 rounded-full bg-ink/76 px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[0.09em] text-surface">
              THE GARMENT
            </figcaption>
          </figure>
          <span
            aria-hidden="true"
            className="absolute top-[52%] left-1/2 z-3 flex size-[26px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-marigold font-mono text-[15px] font-extrabold text-ink shadow-[0_3px_10px_rgba(30,18,51,0.45)]"
          >
            +
          </span>
        </div>

        <figure className="relative overflow-hidden rounded-[8px_26px_26px_8px] shadow-[0_0_0_2.5px_#FFE066,0_20px_40px_-20px_rgba(30,18,51,0.6)]">
          <Image
            src="/landing/after.png"
            alt="The cropped bomber generated on the saved body template"
            fill
            sizes="(min-width: 1024px) 400px, 62vw"
            className="object-cover"
            loading="eager"
          />
          <span className="absolute top-3 left-3 rounded-full bg-marigold px-3 py-[5px] font-mono text-[10.5px] font-extrabold tracking-[0.1em] text-ink">
            TRIED ON
          </span>
          <span className="absolute top-3 right-3 rounded-full bg-surface/94 px-3 py-1.5 text-[11.5px] font-extrabold text-violet">
            94% you
          </span>
          <figcaption className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-[20px_20px_20px_8px] bg-ink/90 px-3.5 py-3 backdrop-blur-[10px]">
            <span
              aria-hidden="true"
              className="flex size-[26px] flex-none items-center justify-center rounded-[50%_50%_50%_9px] bg-marigold"
            >
              <span className="h-3 w-[9px] rounded-[50%/60%_60%_40%_40%] bg-violet" />
            </span>
            <span className="text-[12.5px] leading-[1.4] text-surface">
              Cropped bomber generated on your saved full-body template.
            </span>
          </figcaption>
        </figure>
      </div>

      <p className="absolute -top-6 -right-5.5 hidden rounded-[20px] bg-surface-raised px-4 py-3 shadow-[0_18px_34px_-18px_rgba(30,18,51,0.45)] motion-safe:animate-float-y sm:block">
        <span className="block font-mono text-[9.5px] font-bold tracking-[0.1em] text-text-tertiary">
          TRY-ON READY
        </span>
        <span className="mt-1 block text-[13px] font-bold tracking-[-0.02em] text-ink">
          Generated in 18s
        </span>
      </p>
    </div>
  );
}
