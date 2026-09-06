import type { Metadata } from "next";

import { AuthScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free Fitly account with Google and start a try-on.",
};

export default function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
