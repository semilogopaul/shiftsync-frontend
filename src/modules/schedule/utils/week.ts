/**
 * Week math helpers. We use ISO weeks (Monday → Sunday) consistently across
 * the schedule UI so manager + staff see the same week boundaries regardless
 * of locale defaults.
 */
import {
  addDays,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
  addWeeks,
} from "date-fns";

export interface WeekRange {
  readonly start: Date;
  readonly end: Date;
}

export const weekContaining = (reference: Date): WeekRange => ({
  start: startOfWeek(reference, { weekStartsOn: 1 }),
  end: endOfWeek(reference, { weekStartsOn: 1 }),
});

export const previousWeek = (range: WeekRange): WeekRange =>
  weekContaining(subWeeks(range.start, 1));

export const nextWeek = (range: WeekRange): WeekRange =>
  weekContaining(addWeeks(range.start, 1));

export const daysInWeek = (range: WeekRange): readonly Date[] =>
  Array.from({ length: 7 }, (_, i) => addDays(range.start, i));

export const formatWeekLabel = (range: WeekRange): string => {
  const sameMonth =
    range.start.getMonth() === range.end.getMonth() &&
    range.start.getFullYear() === range.end.getFullYear();
  if (sameMonth) {
    return `${format(range.start, "MMM d")} – ${format(range.end, "d, yyyy")}`;
  }
  return `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`;
};
