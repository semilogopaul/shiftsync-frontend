import { apiGet } from "@/lib/api-client";

export interface OvertimeStaffRow {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly totalHours: number;
  readonly status: "OK" | "APPROACHING" | "OVERTIME";
  readonly tippingAssignment: {
    readonly shiftId: string;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly cumulativeHours: number;
  } | null;
}

export interface OvertimeReport {
  readonly window: { readonly start: string; readonly end: string };
  readonly staff: readonly OvertimeStaffRow[];
}

export interface DistributionStaffRow {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly totalHours: number;
  readonly premiumHours: number;
  readonly userPremiumShare: number;
  readonly fairnessScore: number;
  readonly desiredWeeklyHours: number | null;
  readonly desiredHoursForWindow: number | null;
  readonly scheduleVariance: number | null;
  readonly scheduleStatus: "OK" | "UNDER" | "ON_TARGET" | "OVER" | "UNKNOWN";
}

export interface DistributionReport {
  readonly window: { readonly start: string; readonly end: string; readonly weeks: number };
  readonly org: {
    readonly totalHours: number;
    readonly totalPremiumHours: number;
    readonly premiumShare: number;
    readonly staffCount: number;
  };
  readonly staff: readonly DistributionStaffRow[];
}

interface OvertimeQuery {
  readonly weekContaining?: string;
  readonly locationId?: string;
}

interface DistributionQuery {
  readonly start?: string;
  readonly end?: string;
  readonly locationId?: string;
}

const cleanParams = (input: object) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const analyticsService = {
  overtime: (params: OvertimeQuery = {}) =>
    apiGet<OvertimeReport>("/analytics/overtime", {
      params: cleanParams(params),
    }),
  distribution: (params: DistributionQuery = {}) =>
    apiGet<DistributionReport>("/analytics/distribution", {
      params: cleanParams(params),
    }),
} as const;
