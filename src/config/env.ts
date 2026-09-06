import { z } from "zod";

const publicEnvSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  supabaseSecretKey: z.string().min(1),
  googleOAuthClientId: z.string().min(1),
  googleOAuthClientSecret: z.string().min(1),
  authStateSecret: z.string().min(32),
  fitlyEnvironment: z.string().min(1).default("development"),
});

export function getPublicEnv() {
  return publicEnvSchema.parse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    ...getPublicEnv(),
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    authStateSecret: process.env.AUTH_STATE_SECRET,
    fitlyEnvironment: process.env.FITLY_ENVIRONMENT,
  });
}
