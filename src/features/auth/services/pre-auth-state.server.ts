import "server-only";

import { getServerEnv } from "@/config/env";

import {
  AI_PROCESSING_VERSION,
  PRE_AUTH_MAX_AGE_SECONDS,
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "../auth.constants";

export type PreAuthState = {
  readonly next: string;
  readonly termsVersion: string;
  readonly privacyVersion: string;
  readonly aiProcessingVersion: string;
  readonly expiresAt: number;
};

export async function createPreAuthState(next: string): Promise<string> {
  const state: PreAuthState = {
    next,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    aiProcessingVersion: AI_PROCESSING_VERSION,
    expiresAt: Date.now() + PRE_AUTH_MAX_AGE_SECONDS * 1000,
  };
  const payload = toBase64Url(JSON.stringify(state));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function readPreAuthState(value: string | undefined): Promise<PreAuthState | null> {
  if (!value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = await sign(payload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const parsed: unknown = JSON.parse(fromBase64Url(payload));
    if (typeof parsed !== "object" || parsed === null) return null;
    const state = parsed as Record<string, unknown>;
    if (
      typeof state.next !== "string" ||
      !state.next.startsWith("/") ||
      state.next.startsWith("//") ||
      state.termsVersion !== TERMS_VERSION ||
      state.privacyVersion !== PRIVACY_VERSION ||
      state.aiProcessingVersion !== AI_PROCESSING_VERSION ||
      typeof state.expiresAt !== "number" ||
      state.expiresAt < Date.now()
    ) {
      return null;
    }
    return {
      next: state.next,
      termsVersion: state.termsVersion,
      privacyVersion: state.privacyVersion,
      aiProcessingVersion: state.aiProcessingVersion,
      expiresAt: state.expiresAt,
    };
  } catch {
    return null;
  }
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getServerEnv().authStateSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function toBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function bytesToBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
