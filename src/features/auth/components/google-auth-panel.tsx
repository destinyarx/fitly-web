"use client";

import Link from "next/link";
import { useState } from "react";

import { CheckIcon, GoogleIcon } from "@/shared/components/icons";

type GoogleAuthPanelProps = {
  readonly mode: "signin" | "signup";
  readonly nextPath?: string;
};

/**
 * Owns the only interactive part of the auth card: consent confirmation
 * and the Google redirect. Consents are a gate on this screen, not persisted
 * form data, so local state is enough — no React Hook Form, no store.
 */
export function GoogleAuthPanel({
  mode,
  nextPath = "/looks",
}: GoogleAuthPanelProps) {
  const isSignUp = mode === "signup";
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isPhotoConsented, setIsPhotoConsented] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canContinue = !isRedirecting && isAgeConfirmed && isPhotoConsented;

  async function handleGoogleAuth() {
    setIsRedirecting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          acceptsAiProcessing: isPhotoConsented,
          acceptsTerms: isAgeConfirmed,
          next: nextPath,
        }),
      });
      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("url" in result) ||
        typeof result.url !== "string"
      ) {
        throw new Error("Google authorization could not be started");
      }

      window.location.assign(result.url);
    } catch {
      setIsRedirecting(false);
      setErrorMessage(
        "We could not reach Google just now. Check your connection and try again.",
      );
    }
  }

  return (
    <>
      <fieldset className="mt-5.5 overflow-hidden rounded-[20px] border-0 bg-[#FBF8F3] p-0 shadow-[inset_0_0_0_1.4px_rgba(30,18,51,0.09)]">
          <legend className="sr-only">Before continuing with Google</legend>

          <ConsentRow
            isChecked={isAgeConfirmed}
            onChange={setIsAgeConfirmed}
            className="shadow-[0_1px_0_rgba(30,18,51,0.08)]"
          >
            I&apos;m 18 or older and I agree to the{" "}
            <Link href="/terms" className="font-bold">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold">
              Privacy Policy
            </Link>
            .
          </ConsentRow>

          <ConsentRow
            isChecked={isPhotoConsented}
            onChange={setIsPhotoConsented}
          >
            The photos I upload are of me, and I agree they&apos;re processed to
            generate try-ons and{" "}
            <strong className="font-bold text-violet">
              stored in my own cloud drive
            </strong>
            .
          </ConsentRow>
      </fieldset>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={!canContinue}
        aria-describedby="consent-hint"
        className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-[28px] bg-surface-raised text-[15.5px] font-bold tracking-[-0.01em] text-ink shadow-[0_10px_26px_-12px_rgba(30,18,51,0.5),inset_0_0_0_1.5px_rgba(30,18,51,0.1)] transition-transform not-disabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-[inset_0_0_0_1.5px_rgba(30,18,51,0.12)]"
      >
        <GoogleIcon />
        <span>
          {isRedirecting
            ? "Opening Google…"
            : isSignUp
              ? "Sign up with Google"
              : "Continue with Google"}
        </span>
      </button>

      {!canContinue && !isRedirecting ? (
        <p
          id="consent-hint"
          className="mt-2.5 text-center text-[12.5px] font-semibold text-text-secondary"
        >
          Confirm both boxes above to continue with Google.
        </p>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="mt-2.5 rounded-2xl bg-coral/10 px-4 py-3 text-center text-[12.5px] font-semibold text-coral-deep"
        >
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}

type ConsentRowProps = {
  readonly isChecked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly className?: string;
  readonly children: React.ReactNode;
};

function ConsentRow({
  children,
  className = "",
  isChecked,
  onChange,
}: ConsentRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3.5 px-4.5 py-4 transition-colors hover:bg-violet/4 ${className}`}
    >
      <span className="relative mt-px flex size-6 flex-none items-center justify-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 size-full appearance-none rounded-[7px] shadow-[inset_0_0_0_1.8px_#4A2AB8] checked:bg-violet"
        />
        <span className="pointer-events-none relative hidden peer-checked:block">
          <CheckIcon size={13} stroke="#FFF6EC" />
        </span>
      </span>
      <span className="flex-1 text-[13.5px] leading-[1.45] text-ink">
        {children}
      </span>
    </label>
  );
}
