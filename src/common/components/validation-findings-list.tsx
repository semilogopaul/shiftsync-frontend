"use client";

import { AlertCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { findingTitle } from "@/common/constants/validation-codes";
import { extractValidationPreview } from "@/common/utils/validation-errors";
import { messageFromError } from "@/common/utils/error-message";
import type {
  AlternativeStaff,
  ValidationFinding,
} from "@/common/types/domain";

/**
 * Renders a structured backend error in a way that satisfies the assessment
 * rule "the system must clearly explain which rule was broken and why" — and
 * surfaces the suggested-alternatives list when the backend includes one.
 *
 * Three rendering paths, in priority order:
 *   1. `E_VALIDATION` envelope with a 422 preview body → list each finding +
 *      alternatives with reasons.
 *   2. Inline `findings`/`alternatives` props (used when a caller already has
 *      a preview from `previewAssignment`).
 *   3. Plain message fallback for any other ApiError.
 */
interface Props {
  readonly error?: unknown;
  readonly findings?: readonly ValidationFinding[];
  readonly alternatives?: readonly AlternativeStaff[];
  readonly fallback?: string;
  readonly className?: string;
}

export function ValidationFindingsList({
  error,
  findings,
  alternatives,
  fallback = "Something went wrong.",
  className,
}: Props): React.ReactElement | null {
  // Always prefer in-prop findings; fall back to extracting from error.
  const preview = error ? extractValidationPreview(error) : null;
  const resolvedFindings: readonly ValidationFinding[] =
    findings && findings.length > 0
      ? findings
      : (preview?.findings ?? []);
  const resolvedAlternatives: readonly AlternativeStaff[] =
    alternatives && alternatives.length > 0
      ? alternatives
      : (preview?.alternatives ?? []);

  if (resolvedFindings.length === 0 && !error && resolvedAlternatives.length === 0) {
    return null;
  }

  // Plain ApiError without structured findings → simple banner.
  if (resolvedFindings.length === 0 && error) {
    return (
      <div
        role="alert"
        className={
          "border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm " +
          (className ?? "")
        }
      >
        {messageFromError(error, fallback)}
      </div>
    );
  }

  const errors = resolvedFindings.filter((f) => f.severity === "error");
  const warnings = resolvedFindings.filter((f) => f.severity === "warning");

  return (
    <div className={"space-y-3 " + (className ?? "")} role="alert">
      {errors.length > 0 ? (
        <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-3">
          <p className="text-destructive flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Rules broken
          </p>
          <ul className="mt-2 space-y-2">
            {errors.map((f, i) => (
              <li key={`${f.code}-${i}`} className="text-sm">
                <span className="text-destructive font-medium">{findingTitle(f.code)}</span>
                <span className="text-foreground/80"> — {f.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Warnings
          </p>
          <ul className="mt-2 space-y-2">
            {warnings.map((f, i) => (
              <li key={`${f.code}-${i}`} className="text-sm">
                <span className="font-medium text-amber-700 dark:text-amber-400">
                  {findingTitle(f.code)}
                </span>
                <span className="text-foreground/80"> — {f.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {resolvedAlternatives.length > 0 ? (
        <div className="border-border/60 bg-muted/40 rounded-lg border p-3">
          <p className="text-foreground/80 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            Suggested alternatives
          </p>
          <ul className="mt-2 space-y-2">
            {resolvedAlternatives.map((alt) => (
              <li key={alt.user.id} className="text-sm">
                <span className="font-medium">
                  {alt.user.firstName} {alt.user.lastName}
                </span>
                {alt.reasons.length > 0 ? (
                  <span className="text-muted-foreground">
                    {" — "}
                    {alt.reasons.join(", ")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Convenience helper: pull a flat human message from an ApiError. */
export const messageFor = (err: unknown, fallback: string): string =>
  err instanceof ApiError
    ? err.message || fallback
    : err instanceof Error
      ? err.message
      : fallback;
