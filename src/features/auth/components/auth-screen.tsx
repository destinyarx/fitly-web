import Image from "next/image";
import Link from "next/link";

import { GoogleAuthPanel } from "./google-auth-panel";

type AuthMode = "signin" | "signup";

type AuthCopy = {
  readonly imageTag: string;
  readonly heroTitle: string;
  readonly heroBody: string;
  readonly points: readonly string[];
  readonly title: string;
  readonly subtitle: string;
  readonly footnote: string;
  readonly switchPrompt: string;
  readonly switchAction: string;
  readonly switchHref: string;
};

const COPY: Record<AuthMode, AuthCopy> = {
  signup: {
    imageTag: "FITLY — VIRTUAL TRY-ON",
    heroTitle: "See it on you before you buy.",
    heroBody:
      "Save one body template, drop in any garment, get the try-on.",
    points: ["3 free try-ons a day", "Google sign-in only", "No card needed"],
    title: "Create your Fitly account",
    subtitle:
      "Fitly is Google sign-in only. Confirm the two boxes below to continue.",
    footnote: "We only read your name, email and profile photo.",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
    switchHref: "/sign-in",
  },
  signin: {
    imageTag: "WELCOME BACK",
    heroTitle: "Your mirror, right where you left it.",
    heroBody: "Your templates, closet and looks are waiting.",
    points: ["Templates saved", "Closet intact", "Looks in your drive"],
    title: "Welcome back",
    subtitle: "Continue with the Google account tied to your closet.",
    footnote: "Trouble signing in? Use the same Google account as on mobile.",
    switchPrompt: "New to Fitly?",
    switchAction: "Create a free account",
    switchHref: "/sign-up",
  },
};

const CALLBACK_ERRORS: Record<string, string> = {
  missing_code:
    "Google sent us back without a sign-in code. Please try signing in again.",
  exchange_failed:
    "We could not finish that sign-in. Please try again, and pick the same Google account you used before.",
};

type AuthScreenProps = {
  readonly mode: AuthMode;
  readonly errorCode?: string;
  readonly nextPath?: string;
};

export function AuthScreen({ errorCode, mode, nextPath }: AuthScreenProps) {
  const copy = COPY[mode];
  const callbackError = errorCode ? CALLBACK_ERRORS[errorCode] : undefined;

  return (
    <div className="grid min-h-dvh bg-[#F2ECE2] lg:grid-cols-[1.08fr_1fr]">
      <EditorialPanel copy={copy} />

      <main className="flex items-center justify-center px-5 py-11 sm:px-14">
        <div className="w-full max-w-[436px] rounded-[34px] bg-surface-raised p-7 shadow-[0_30px_70px_-40px_rgba(30,18,51,0.45),inset_0_0_0_1px_rgba(30,18,51,0.05)] sm:p-10">
          <nav aria-label="Authentication" className="flex rounded-full bg-ink/6 p-1">
            <AuthTab href="/sign-in" isActive={mode === "signin"}>
              Sign in
            </AuthTab>
            <AuthTab href="/sign-up" isActive={mode === "signup"}>
              Create account
            </AuthTab>
          </nav>

          <h1 className="font-display mt-6 text-[31px] leading-[1.04] font-extrabold tracking-[-0.045em] text-ink">
            {copy.title}
          </h1>
          <p className="mt-2.5 text-[14.5px] leading-[1.5] text-pretty text-text-secondary">
            {copy.subtitle}
          </p>

          {callbackError ? (
            <p
              role="alert"
              className="mt-5.5 rounded-[20px] bg-coral/10 px-4.5 py-4 text-[13px] leading-[1.45] font-semibold text-coral-deep"
            >
              {callbackError}
            </p>
          ) : null}

          {mode === "signin" ? <MobilePhotosNotice /> : null}

          <GoogleAuthPanel mode={mode} nextPath={nextPath} />

          <p className="mt-3 text-center text-[12.5px] leading-[1.45] text-text-tertiary">
            {copy.footnote}
          </p>

          <p className="mt-6.5 flex items-center justify-center gap-1.5 pt-5.5 shadow-[inset_0_1px_0_rgba(30,18,51,0.09)]">
            <span className="text-[13.5px] text-text-secondary">
              {copy.switchPrompt}
            </span>
            <Link
              href={copy.switchHref}
              className="text-[13.5px] font-bold text-violet"
            >
              {copy.switchAction}
            </Link>
          </p>

          <p className="mt-3.5 text-center">
            <Link
              href="/"
              className="text-[13px] font-semibold text-text-tertiary transition-colors hover:text-violet"
            >
              ← Back to fitly.app
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function AuthTab({
  children,
  href,
  isActive,
}: {
  readonly href: string;
  readonly isActive: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex-1 rounded-full px-4.5 py-2.5 text-center text-[13.5px] font-bold ${
        isActive
          ? "bg-surface-raised text-ink shadow-[0_2px_8px_rgba(30,18,51,0.12)]"
          : "text-text-tertiary"
      }`}
    >
      {children}
    </Link>
  );
}

function MobilePhotosNotice() {
  return (
    <aside className="mt-5.5 flex items-start gap-3 rounded-[20px] bg-marigold/16 px-4.5 py-4 shadow-[inset_0_0_0_1.4px_rgba(255,224,102,0.55)]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        className="mt-px flex-none"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="1.6"
          width="8"
          height="16.8"
          rx="2.2"
          fill="none"
          stroke="#8A6A00"
          strokeWidth="1.6"
        />
        <path
          d="M8.8 15.6h2.4"
          stroke="#8A6A00"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <h2 className="text-[13.5px] font-bold tracking-[-0.01em] text-[#5E4A00]">
          Mobile photos stay on your phone
        </h2>
        <p className="mt-1 text-[12.5px] leading-[1.45] text-[#7A6320]">
          Try-ons you made in the Fitly Android app are stored on that device,
          not in the cloud — so they won&apos;t appear here. Web try-ons live in
          your connected cloud drive and sync only to the web app.
        </p>
      </div>
    </aside>
  );
}

function EditorialPanel({ copy }: { readonly copy: AuthCopy }) {
  return (
    <div className="relative hidden overflow-hidden bg-[#160D2B] lg:block">
      <Image
        src="/landing/after.png"
        alt=""
        fill
        sizes="52vw"
        className="object-cover"
        loading="eager"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(168deg,rgba(22,13,43,0.82)_0%,rgba(36,24,68,0.42)_38%,rgba(22,13,43,0.9)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-45 -left-35 size-[520px] rounded-full bg-[radial-gradient(circle_at_45%_45%,rgba(255,224,102,0.24),rgba(255,224,102,0)_68%)]"
      />

      <div className="relative flex h-full min-h-dvh flex-col justify-between px-13 py-11">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display flex size-8.5 items-center justify-center rounded-[11px] bg-marigold text-[19px] font-extrabold text-ink">
              F
            </span>
            <span className="font-display text-[23px] font-extrabold tracking-[-0.04em] text-surface">
              Fitly
            </span>
          </Link>
          <span className="rounded-full bg-surface/14 px-3.5 py-[7px] font-mono text-[9.5px] font-bold tracking-[0.13em] text-surface/90 backdrop-blur-[10px]">
            {copy.imageTag}
          </span>
        </div>

        <div className="max-w-[470px]">
          <p className="font-display text-[52px] leading-[0.98] font-extrabold tracking-[-0.05em] text-pretty text-surface">
            {copy.heroTitle}
          </p>
          <p className="mt-4 max-w-[400px] text-[16.5px] leading-[1.5] text-pretty text-surface/66">
            {copy.heroBody}
          </p>
          <ul className="mt-6.5 flex flex-wrap items-center gap-3.5">
            {copy.points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-[5px] rounded-full bg-marigold"
                />
                <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-surface/78">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2.5">
          <svg
            width="15"
            height="15"
            viewBox="0 0 22 22"
            className="flex-none"
            aria-hidden="true"
          >
            <path
              d="M11 2.2l7 2.6v6.1c0 4.3-2.9 7.6-7 8.9-4.1-1.3-7-4.6-7-8.9V4.8l7-2.6z"
              fill="none"
              stroke="rgba(255,224,102,.85)"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M7.8 11.1l2.2 2.2 4.2-4.5"
              fill="none"
              stroke="rgba(255,224,102,.85)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[12.5px] font-semibold text-surface/55">
            Your photos stay in your own cloud drive — never on our servers.
          </span>
        </p>
      </div>
    </div>
  );
}
