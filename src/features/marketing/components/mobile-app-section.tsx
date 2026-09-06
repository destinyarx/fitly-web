import Image from "next/image";

import { CheckIcon, LockIcon } from "@/shared/components/icons";

import { MOBILE_FEATURES } from "../marketing.constants";

const CLOSET_TILES = [
  "from-lilac to-lilac-soft",
  "from-peach-soft to-[#FFF0E2]",
  "from-[#C9D4E8] to-[#E8EDF6]",
  "from-[#FFE9A8] to-[#FFF6DC]",
  "from-lilac to-lilac-soft",
  "from-peach-soft to-[#FFF0E2]",
] as const;

export function MobileAppSection() {
  return (
    <section
      id="mobile"
      className="mx-auto max-w-[1240px] px-5 pb-20 md:px-10 lg:pb-25"
    >
      <div className="relative overflow-hidden rounded-[40px] bg-linear-150 from-lilac via-lilac-soft to-surface via-62% shadow-[inset_0_0_0_1.5px_rgba(30,18,51,0.07)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-30 -bottom-40 size-[520px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(255,224,102,0.5),rgba(255,224,102,0)_68%)]"
        />
        <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_0.92fr] lg:px-15 lg:py-16">
          <div>
            <p className="font-mono text-xs font-bold tracking-[0.12em] text-violet">
              FITLY ON MOBILE
            </p>
            <h2 className="font-display mt-3.5 text-[clamp(2rem,4.4vw,46px)] leading-none font-extrabold tracking-[-0.045em] text-pretty text-ink">
              The mirror that fits
              <br />
              in the fitting room.
            </h2>
            <p className="mt-4.5 max-w-[460px] text-[17px] leading-[1.52] text-pretty text-text-secondary">
              Same closet, same looks, same try-ons — plus the camera. Snap a
              piece on the rack and see it on you before you queue for the
              changing room.
            </p>

            <ul className="mt-6 flex flex-col gap-2.5">
              {MOBILE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex size-[22px] flex-none items-center justify-center rounded-[7px] bg-violet/12">
                    <CheckIcon size={12} stroke="#4A2AB8" />
                  </span>
                  <span className="text-[15px] font-semibold text-ink">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://play.google.com/store"
                className="flex items-center gap-3.5 rounded-full bg-ink py-3.5 pr-6.5 pl-5 shadow-[0_18px_34px_-18px_rgba(30,18,51,0.85)] transition-transform hover:-translate-y-0.5"
              >
                <AndroidIcon />
                <span className="block">
                  <span className="block font-mono text-[9.5px] font-bold tracking-[0.11em] text-surface/60">
                    DOWNLOAD FOR
                  </span>
                  <span className="mt-0.5 block text-base font-bold tracking-[-0.02em] text-surface">
                    Android
                  </span>
                </span>
              </a>

              <p className="flex cursor-not-allowed items-center gap-3 rounded-full px-6 py-3.5 shadow-[inset_0_0_0_1.6px_rgba(30,18,51,0.16)]">
                <LockIcon width={15} height={17} fill="rgba(30,18,51,.5)" />
                <span className="block">
                  <span className="block font-mono text-[9.5px] font-bold tracking-[0.11em] text-ink/42">
                    SOON ON
                  </span>
                  <span className="mt-0.5 block text-base font-bold tracking-[-0.02em] text-ink/50">
                    iOS
                  </span>
                </span>
              </p>
            </div>

            <p className="mt-3.5 text-[13px] font-semibold text-text-tertiary">
              Free · Android 9+ · 24 MB · same account, synced closet
            </p>
          </div>

          <div className="relative h-[470px] max-w-[440px] justify-self-center lg:justify-self-end">
            <div className="absolute bottom-3.5 left-2 h-[394px] w-[196px] -rotate-7 rounded-[38px] bg-ink p-[7px] shadow-[0_34px_60px_-30px_rgba(30,18,51,0.6)]">
              <div className="flex h-full flex-col overflow-hidden rounded-[32px] bg-surface">
                <div className="px-3.5 pt-4 pb-2.5">
                  <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-text-tertiary">
                    YOUR CLOSET
                  </p>
                  <p className="font-display mt-0.5 text-[19px] font-extrabold tracking-[-0.04em] text-ink">
                    24 pieces
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="grid flex-1 grid-cols-2 content-start gap-2.5 px-3 [grid-auto-rows:82px]"
                >
                  {CLOSET_TILES.map((tile, index) => (
                    <span
                      key={`${tile}-${index}`}
                      className={`rounded-[14px] bg-linear-160 ${tile}`}
                    />
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="mx-3 mt-2.5 mb-3 flex h-11.5 items-center justify-around rounded-[18px] bg-ink px-2"
                >
                  <span className="size-[7px] rounded-full bg-marigold" />
                  <span className="size-[7px] rounded-full bg-surface/35" />
                  <span className="size-[7px] rounded-full bg-surface/35" />
                  <span className="size-[7px] rounded-full bg-surface/35" />
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-1.5 h-[446px] w-[222px] rotate-4 rounded-[42px] bg-ink p-[7px] shadow-[0_40px_70px_-30px_rgba(30,18,51,0.7)] motion-safe:animate-float-y">
              <div className="relative h-full overflow-hidden rounded-[36px] bg-[#241844]">
                <Image
                  src="/landing/after.png"
                  alt="A Fitly try-on open in the Android app"
                  fill
                  sizes="222px"
                  className="object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 left-1/2 h-5 w-[74px] -translate-x-1/2 rounded-full bg-ink"
                />
                <span className="absolute top-10 left-3 rounded-full bg-marigold px-2.5 py-1 font-mono text-[9px] font-extrabold tracking-[0.1em] text-ink">
                  TRIED ON
                </span>
                <span className="absolute top-10 right-3 rounded-full bg-surface/94 px-2.5 py-1 text-[10px] font-extrabold text-violet">
                  94% you
                </span>
                <p className="absolute right-3 bottom-16 left-3 flex items-center gap-2.5 rounded-[18px_18px_18px_6px] bg-ink/90 px-3 py-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-[22px] flex-none items-center justify-center rounded-[50%_50%_50%_8px] bg-marigold"
                  >
                    <span className="h-2.5 w-2 rounded-[50%/60%_60%_40%_40%] bg-violet" />
                  </span>
                  <span className="text-[11px] leading-[1.35] text-surface">
                    Rack shot processed — try-on generated in 16s.
                  </span>
                </p>
                <div
                  aria-hidden="true"
                  className="absolute right-3 bottom-3 left-3 flex items-center gap-2"
                >
                  <span className="flex h-10 flex-1 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink">
                    Save look
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-surface/18">
                    <svg width="17" height="17" viewBox="0 0 18 18">
                      <rect
                        x="1"
                        y="4"
                        width="16"
                        height="12"
                        rx="4"
                        fill="none"
                        stroke="#FFF6EC"
                        strokeWidth="1.7"
                      />
                      <circle
                        cx="9"
                        cy="10"
                        r="3.2"
                        fill="none"
                        stroke="#FFF6EC"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <p className="absolute top-0 -left-2.5 rounded-[18px] bg-surface-raised px-4 py-3 shadow-[0_18px_34px_-18px_rgba(30,18,51,0.5)] motion-safe:animate-float-y">
              <span className="block font-mono text-[9px] font-bold tracking-[0.1em] whitespace-nowrap text-text-tertiary">
                IN-STORE MODE
              </span>
              <span className="mt-0.5 block text-[12.5px] font-bold tracking-[-0.02em] whitespace-nowrap text-ink">
                Camera try-on
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AndroidIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.6 9.6h10.8v7.9a1.7 1.7 0 01-1.7 1.7H8.3a1.7 1.7 0 01-1.7-1.7V9.6z"
        fill="#FFE066"
      />
      <rect x="3" y="9.6" width="2.7" height="6.6" rx="1.35" fill="#FFE066" />
      <rect x="18.3" y="9.6" width="2.7" height="6.6" rx="1.35" fill="#FFE066" />
      <rect x="8.7" y="19.4" width="2.3" height="3.6" rx="1.15" fill="#FFE066" />
      <rect x="13" y="19.4" width="2.3" height="3.6" rx="1.15" fill="#FFE066" />
      <path d="M6.6 8.5a5.4 5.4 0 0110.8 0z" fill="#FFE066" />
      <path
        d="M8.4 3.6L7.3 1.9M15.6 3.6l1.1-1.7"
        stroke="#FFE066"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9.8" cy="6.3" r=".85" fill="#1E1233" />
      <circle cx="14.2" cy="6.3" r=".85" fill="#1E1233" />
    </svg>
  );
}
