"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/modules/auth";
import { useLocations } from "@/modules/locations";
import { formatTimeRange } from "@/common/utils/datetime";
import type { Shift } from "@/common/types/domain";
import {
  daysInWeek,
  formatWeekLabel,
  nextWeek,
  previousWeek,
  weekContaining,
} from "../utils/week";
import { useShifts, useShiftMutations } from "../hooks/use-shifts";
import { ShiftDrawer } from "./shift-drawer";
import { CreateShiftDialog } from "./create-shift-dialog";
import { toast } from "sonner";

export function ScheduleView() {
  const { data: user } = useCurrentUser();
  const { data: locations = [] } = useLocations();
  const [locationId, setLocationId] = useState<string | "all">("all");
  const [range, setRange] = useState(() => weekContaining(new Date()));
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const params = useMemo(
    () => ({
      locationId: locationId === "all" ? undefined : locationId,
      from: range.start.toISOString(),
      to: range.end.toISOString(),
    }),
    [locationId, range],
  );

  const { data: shifts = [], isLoading } = useShifts(params);
  const days = daysInWeek(range);
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const mutations = useShiftMutations();
  // Only DRAFT shifts in the visible window are eligible for bulk publish.
  // Backend enforces manager-of-location, so the count we show is best-effort
  // and the response tells us how many were actually transitioned.
  const draftIds = useMemo(
    () => shifts.filter((s) => s.status === "DRAFT").map((s) => s.id),
    [shifts],
  );
  const handlePublishWeek = () => {
    if (draftIds.length === 0) return;
    mutations.publishMany.mutate(draftIds, {
      onSuccess: (result) => {
        const n = result.publishedIds.length;
        const skipped = draftIds.length - n;
        if (n === 0) {
          toast("No shifts published", {
            description: "Nothing eligible — they may already be published or out of your scope.",
          });
        } else {
          toast.success(
            `Published ${n} shift${n === 1 ? "" : "s"}` +
              (skipped > 0 ? ` · ${skipped} skipped` : ""),
          );
        }
      },
      onError: () => toast.error("Could not publish week"),
    });
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground text-sm">
            {formatWeekLabel(range)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="border-border/60 flex overflow-hidden rounded-lg border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRange(previousWeek(range))}
              aria-label="Previous week"
              className="rounded-none"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRange(weekContaining(new Date()))}
              className="rounded-none px-3"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRange(nextWeek(range))}
              aria-label="Next week"
              className="rounded-none"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {canManage ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePublishWeek}
                disabled={
                  draftIds.length === 0 || mutations.publishMany.isPending
                }
                title={
                  draftIds.length === 0
                    ? "Nothing to publish in this week"
                    : `Publish ${draftIds.length} draft shift${draftIds.length === 1 ? "" : "s"}`
                }
              >
                {mutations.publishMany.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="mr-1 h-4 w-4" aria-hidden="true" />
                )}
                Publish week{draftIds.length > 0 ? ` (${draftIds.length})` : ""}
              </Button>
              <Button type="button" size="sm" onClick={() => setCreating(true)}>
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                New shift
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-12">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading schedule…
        </div>
      ) : (
        <div className="border-border/60 bg-card/40 overflow-x-auto rounded-3xl border">
          <div className="grid min-w-[840px] grid-cols-7">
            {days.map((day) => {
              const dayShifts = shifts.filter((shift) => {
                const start = new Date(shift.startsAt);
                return isSameDay(start, day);
              });
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className="border-border/40 min-h-[420px] border-r last:border-r-0"
                >
                  <div
                    className={cn(
                      "border-border/40 flex items-baseline justify-between border-b px-3 py-2",
                      isToday ? "bg-primary/5" : "bg-muted/30",
                    )}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {format(day, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday ? "text-primary" : "text-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <ul className="space-y-2 p-2">
                    {dayShifts.length === 0 ? (
                      <li className="text-muted-foreground/60 px-2 py-4 text-center text-xs">
                        —
                      </li>
                    ) : (
                      dayShifts.map((shift) => (
                        <ShiftPill
                          key={shift.id}
                          shift={shift}
                          onSelect={() => setSelectedShiftId(shift.id)}
                        />
                      ))
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedShiftId ? (
        <ShiftDrawer
          shiftId={selectedShiftId}
          onClose={() => setSelectedShiftId(null)}
        />
      ) : null}

      {creating ? (
        <CreateShiftDialog onClose={() => setCreating(false)} />
      ) : null}
    </section>
  );
}

interface ShiftPillProps {
  readonly shift: Shift;
  readonly onSelect: () => void;
}

function ShiftPill({ shift, onSelect }: ShiftPillProps) {
  const filled = shift.assignments.length;
  const understaffed = filled < shift.headcount;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "group hover:border-primary/40 hover:bg-primary/5 w-full rounded-xl border bg-card p-2.5 text-left transition-colors",
          understaffed
            ? "border-amber-500/40"
            : "border-border/60",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground truncate text-xs font-semibold">
            {shift.location.name}
          </span>
          {shift.isPremium ? (
            <Sparkles className="h-3 w-3 text-fuchsia-500" aria-label="Premium shift" />
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatTimeRange(shift.startsAt, shift.endsAt, shift.location.timezone)}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-semibold",
              understaffed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {filled}/{shift.headcount}
            {shift.skill ? ` · ${shift.skill.name}` : ""}
          </span>
          {shift.status !== "PUBLISHED" ? (
            <span className="text-muted-foreground border-border/60 rounded border px-1.5 text-[10px] uppercase tracking-wider">
              {shift.status === "DRAFT" ? "Draft" : shift.status}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

ScheduleView.Empty = function ScheduleEmpty() {
  return (
    <div className="border-border/60 bg-card/40 flex flex-col items-center gap-3 rounded-3xl border py-16 text-center">
      <CalendarDays className="text-muted-foreground h-8 w-8" aria-hidden="true" />
      <p className="text-foreground text-sm font-medium">No shifts this week</p>
    </div>
  );
};
