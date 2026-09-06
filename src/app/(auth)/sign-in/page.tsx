import type { Metadata } from "next";

import { AuthScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Fitly with the Google account tied to your closet.",
};

type SignInPageProps = {
  searchParams: Promise<{
    readonly error?: string;
    readonly next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, next } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return <AuthScreen mode="signin" errorCode={error} nextPath={nextPath} />;
}
