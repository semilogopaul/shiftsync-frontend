import { ApiError } from "@/lib/api-client";

/**
 * Best-effort, type-safe extraction of a user-facing message from any thrown
 * value. Always returns a non-empty string; never throws.
 */
export const messageFromError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};
