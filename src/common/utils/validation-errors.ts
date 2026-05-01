import { ApiError } from "@/lib/api-client";
import type { AssignmentPreview } from "@/common/types/domain";

/**
 * If `error` is the structured `E_VALIDATION` envelope thrown by the backend
 * (HTTP 422 with `details: AssignmentPreview`), return the embedded preview so
 * the caller can render findings + alternatives. Otherwise returns `null`.
 */
export const extractValidationPreview = (
  error: unknown,
): AssignmentPreview | null => {
  if (!(error instanceof ApiError)) return null;
  if (error.code !== "E_VALIDATION") return null;
  const details = error.details as Partial<AssignmentPreview> | undefined;
  if (
    !details ||
    typeof details !== "object" ||
    !Array.isArray((details as AssignmentPreview).findings)
  ) {
    return null;
  }
  return {
    ok: details.ok ?? false,
    findings: (details.findings ?? []) as AssignmentPreview["findings"],
    alternatives: (details.alternatives ?? []) as AssignmentPreview["alternatives"],
    // Preserve the what-if projection so callers (e.g. the AssignPanel) can
    // surface projected daily/weekly/consecutive hours when the live assign
    // call is rejected with a 422.
    projection: details.projection as AssignmentPreview["projection"],
  };
};
