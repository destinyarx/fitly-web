import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ readonly error?: string }>;
}) {
  const { error } = await searchParams;
  const destination = error
    ? `/sign-in?error=${encodeURIComponent(error)}`
    : "/sign-in";

  redirect(destination);
}
