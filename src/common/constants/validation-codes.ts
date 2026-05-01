/**
 * Mirror of the backend `ValidationCode` enum from
 * `shiftsync-backend/src/modules/shifts/validation/shift-validator.service.ts`.
 * Each code is paired with a short human-friendly title so the UI can render a
 * recognizable rule label alongside the backend's contextual `message`.
 *
 * Keep this list in lock-step with the backend. Unknown codes fall back to the
 * raw code string in `findingTitle()` so additions are non-breaking.
 */
export type ValidationCode =
  | "E_DOUBLE_BOOK"
  | "E_REST_10H"
  | "E_SKILL_MISSING"
  | "E_LOCATION_CERT"
  | "E_AVAILABILITY"
  | "E_DAILY_OVER_12"
  | "E_CONSECUTIVE_7"
  | "W_DAILY_OVER_8"
  | "W_WEEKLY_APPROACHING_40"
  | "W_WEEKLY_OVER_40"
  | "W_CONSECUTIVE_6";

/** Human-friendly title for each rule code. */
export const VALIDATION_TITLES: Record<ValidationCode, string> = {
  E_DOUBLE_BOOK: "Double-booked",
  E_REST_10H: "Rest period (10h)",
  E_SKILL_MISSING: "Skill not held",
  E_LOCATION_CERT: "Not certified for this location",
  E_AVAILABILITY: "Outside availability",
  E_DAILY_OVER_12: "Daily 12h hard limit",
  E_CONSECUTIVE_7: "7th consecutive day",
  W_DAILY_OVER_8: "Over 8h daily",
  W_WEEKLY_APPROACHING_40: "Approaching 40h",
  W_WEEKLY_OVER_40: "Over 40h (overtime)",
  W_CONSECUTIVE_6: "6 consecutive days",
};

/** Codes that a manager may bypass with an override + reason. */
export const OVERRIDABLE_CODES: ReadonlySet<ValidationCode> = new Set([
  "E_CONSECUTIVE_7",
]);

export const isOverridableCode = (code: string): boolean =>
  OVERRIDABLE_CODES.has(code as ValidationCode);

export const findingTitle = (code: string): string =>
  VALIDATION_TITLES[code as ValidationCode] ?? code;
