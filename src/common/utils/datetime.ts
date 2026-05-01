/**
 * Display helpers. Times come from the backend as ISO 8601 in UTC; the
 * authoritative timezone is the *location's* zone, not the browser's. These
 * helpers always take an explicit IANA zone so callers can't accidentally
 * fall back to local time.
 */

const DEFAULT_LOCALE = "en-US";

export const formatInZone = (
  iso: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  },
): string => {
  try {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone: timezone,
      ...options,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatTimeRange = (
  startIso: string,
  endIso: string,
  timezone: string,
): string => {
  const startStr = formatInZone(startIso, timezone, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endStr = formatInZone(endIso, timezone, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  // Append "(next day)" when the shift crosses midnight in its location TZ —
  // helps overnight assignments read unambiguously in lists and pills.
  const startDay = formatInZone(startIso, timezone, { day: "2-digit", month: "2-digit" });
  const endDay = formatInZone(endIso, timezone, { day: "2-digit", month: "2-digit" });
  const suffix = startDay !== endDay ? " (next day)" : "";
  return `${startStr} – ${endStr}${suffix}`;
};

export const formatDayLabel = (iso: string, timezone: string): string =>
  formatInZone(iso, timezone, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

export const formatRelative = (iso: string): string => {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((target - now) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: "auto" });
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 604_800) return rtf.format(Math.round(diffSec / 86_400), "day");
  return rtf.format(Math.round(diffSec / 604_800), "week");
};

export const minutesToLabel = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
};

const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
const DAY_NAMES_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const dayName = (
  dayOfWeek: number,
  format: "short" | "long" = "long",
): string =>
  (format === "short" ? DAY_NAMES_SHORT : DAY_NAMES_LONG)[dayOfWeek] ?? "";

/**
 * Convert a wall-clock date+time entered for a specific IANA timezone into a
 * UTC ISO string. Critical for shift creation: a manager in NY entering "2pm"
 * for an LA shift means 2pm Pacific, not 2pm Eastern.
 *
 * Uses the Intl-offset-difference trick to avoid pulling in a date library:
 *   1. Treat the wall-clock as if it were UTC ("guess").
 *   2. Read what wall-clock that UTC instant displays as in `timezone`.
 *   3. The delta between the two is the zone's offset for that moment;
 *      apply it back to the guess to land on the true UTC instant.
 *
 * Throws RangeError on malformed input. Ambiguous wall times during DST
 * "fall back" resolve to the later instant; skipped times during "spring
 * forward" snap forward by one hour. Both are acceptable defaults — managers
 * almost never schedule shifts inside the 1h DST gap.
 */
export const wallTimeInZoneToUtcIso = (
  date: string,
  time: string,
  timezone: string,
): string => {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(d) ||
    !Number.isFinite(h) ||
    !Number.isFinite(mi)
  ) {
    throw new RangeError(`Invalid date/time: ${date} ${time}`);
  }
  const intendedAsUtc = Date.UTC(y, mo - 1, d, h, mi, 0);
  const guess = new Date(intendedAsUtc);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(guess)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  const seenAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) === 24 ? 0 : Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMs = intendedAsUtc - seenAsUtc;
  return new Date(intendedAsUtc + offsetMs).toISOString();
};

/** True when the end wall-time falls before the start (overnight shift). */
export const isOvernight = (startTime: string, endTime: string): boolean => {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em <= sh * 60 + sm;
};

/** Hours between two ISO instants. */
export const hoursBetween = (startIso: string, endIso: string): number =>
  (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
