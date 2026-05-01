/**
 * Centralised runtime config. Values must be read here, never via
 * `process.env.*` scattered through the codebase.
 *
 * Environment variables that must be exposed to the browser are prefixed with
 * `NEXT_PUBLIC_` per Next.js convention.
 */

const requiredPublic = (key: string, value: string | undefined): string => {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  apiBaseUrl: requiredPublic("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
  realtimeUrl: requiredPublic("NEXT_PUBLIC_REALTIME_URL", process.env.NEXT_PUBLIC_REALTIME_URL),
  appUrl: requiredPublic("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL),
} as const;
