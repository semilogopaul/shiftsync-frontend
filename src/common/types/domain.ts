/**
 * Domain types mirroring the backend shape. Kept narrow and additive — only
 * the fields the UI actually reads. The backend is source of truth; this file
 * is a typed view on the shape it returns.
 */
import type { UserRole } from "./user";

export interface Location {
  readonly id: string;
  readonly name: string;
  readonly timezone: string;
  readonly address?: string | null;
}

export interface SkillRef {
  readonly id: string;
  readonly name: string;
}

export interface UserSummary {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly desiredWeeklyHours?: number | null;
  readonly skills?: readonly SkillRef[];
  readonly certifiedLocationIds?: readonly string[];
}

export interface AssignmentSummary {
  readonly id: string;
  readonly userId: string;
  readonly user: UserSummary;
  readonly clockedInAt?: string | null;
  readonly clockedOutAt?: string | null;
}

export interface Shift {
  readonly id: string;
  readonly locationId: string;
  readonly location: Location;
  readonly skillId?: string | null;
  readonly skill?: SkillRef | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly headcount: number;
  readonly status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  readonly isPremium?: boolean;
  readonly version: number;
  readonly assignments: readonly AssignmentSummary[];
  readonly notes?: string | null;
}

export interface ValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly message: string;
  readonly data?: Record<string, unknown>;
}

export interface AlternativeStaff {
  readonly user: UserSummary;
  readonly reasons: readonly string[];
  readonly score?: number;
}

export interface AssignmentProjection {
  readonly projectedDailyHours: number;
  readonly projectedWeeklyHours: number;
  readonly projectedConsecutiveDays: number;
}

export interface AssignmentPreview {
  readonly ok: boolean;
  readonly findings: readonly ValidationFinding[];
  readonly alternatives: readonly AlternativeStaff[];
  readonly projection?: AssignmentProjection;
}

export type SwapStatus =
  | "PENDING_RECIPIENT"
  | "PENDING_MANAGER"
  | "APPROVED"
  | "REJECTED_BY_RECIPIENT"
  | "REJECTED_BY_MANAGER"
  | "CANCELLED";

export interface SwapRequest {
  readonly id: string;
  readonly status: SwapStatus;
  readonly shiftId: string;
  readonly shift?: Shift;
  readonly fromUserId: string;
  readonly fromUser?: UserSummary;
  readonly toUserId?: string | null;
  readonly toUser?: UserSummary | null;
  readonly reason?: string | null;
  readonly createdAt: string;
  readonly recipientRespondedAt?: string | null;
  readonly managerDecisionAt?: string | null;
  /** Drop-only: only present when this row represents a `DropRequest`. */
  readonly expiresAt?: string;
  readonly claimedById?: string | null;
  readonly claimedBy?: UserSummary | null;
  readonly claimedAt?: string | null;
}

export type DropStatus =
  | "OPEN"
  | "PENDING_MANAGER"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export interface DropRequest {
  readonly id: string;
  readonly status: DropStatus;
  readonly shiftId: string;
  readonly shift?: Shift;
  readonly fromUserId: string;
  readonly fromUser?: UserSummary;
  readonly claimedById?: string | null;
  readonly claimedBy?: UserSummary | null;
  readonly claimedAt?: string | null;
  readonly expiresAt: string;
  readonly reason?: string | null;
  readonly createdAt: string;
  readonly managerDecisionAt?: string | null;
}

/** Counters returned by `GET /swaps/me` so the UI can pre-flight the 3-pending limit. */
export interface PendingCounts {
  readonly pendingSwaps: number;
  readonly pendingDrops: number;
  readonly total: number;
  readonly limit: number;
}

export interface AvailabilityWindow {
  readonly id: string;
  readonly userId: string;
  readonly dayOfWeek: number; // 0=Sun..6=Sat
  readonly startMinute: number;
  readonly endMinute: number;
  readonly timezone: string;
}

export interface AvailabilityException {
  readonly id: string;
  readonly userId: string;
  readonly type: "AVAILABLE" | "UNAVAILABLE";
  readonly startsAt: string;
  readonly endsAt: string;
  readonly note?: string | null;
}

export interface NotificationItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly readAt: string | null;
  readonly createdAt: string;
  readonly payload?: Record<string, unknown>;
}

export interface AuditLogEntry {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly actorId: string | null;
  readonly actor?: UserSummary | null;
  readonly before?: unknown;
  readonly after?: unknown;
  readonly meta?: Record<string, unknown>;
  readonly createdAt: string;
}
