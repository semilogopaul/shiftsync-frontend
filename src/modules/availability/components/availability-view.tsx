"use client";

import { useState, type FormEvent } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { dayName, minutesToLabel } from "@/common/utils/datetime";
import { messageFromError } from "@/common/utils/error-message";
import { useCurrentUser } from "@/modules/auth";
import { availabilityService } from "../services/availability-service";

const windowsKey = (uid: string) => ["availability", "windows", uid] as const;
const exceptionsKey = (uid: string) =>
  ["availability", "exceptions", uid] as const;

export function AvailabilityView() {
  const { data: user } = useCurrentUser();
  if (!user) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-12">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="text-muted-foreground text-sm">
          Recurring weekly windows and one-off exceptions. Managers see this
          when they’re looking for coverage.
        </p>
      </header>

      <RecurringWindows userId={user.id} />
      <Exceptions userId={user.id} />
    </section>
  );
}

const browserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

function RecurringWindows({ userId }: { readonly userId: string }) {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: windowsKey(userId),
    queryFn: () => availabilityService.listForUser(userId),
  });
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const create = useMutation({
    mutationFn: (input: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      timezone: string;
    }) => availabilityService.createWindow(userId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: windowsKey(userId) }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => availabilityService.deleteWindow(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: windowsKey(userId) }),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({
      dayOfWeek: Number(day),
      startMinute: hhmmToMin(start),
      endMinute: hhmmToMin(end),
      timezone: browserTimezone(),
    });
  };

  const items = list.data ?? [];

  return (
    <div className="border-border/60 bg-card/40 rounded-3xl border p-5">
      <h2 className="text-foreground text-lg font-semibold">Weekly windows</h2>

      <form
        onSubmit={onSubmit}
        className="border-border/60 mt-4 grid gap-3 rounded-2xl border bg-background/50 p-4 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="day">Day</Label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger id="day">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {dayName(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start">Start</Label>
          <Input
            id="start"
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">End</Label>
          <Input
            id="end"
            type="time"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={create.isPending} className="w-full sm:w-auto">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        {create.error ? (
          <p className="text-destructive sm:col-span-4 text-xs">
            {messageFromError(create.error, "Could not add window.")}
          </p>
        ) : null}
      </form>

      <ul className="mt-5 space-y-2">
        {list.isLoading ? (
          <li className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </li>
        ) : items.length === 0 ? (
          <li className="text-muted-foreground text-sm">
            You haven’t added any weekly windows yet.
          </li>
        ) : (
          items.map((win) => (
            <li
              key={win.id}
              className="border-border/60 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div>
                <p className="text-foreground text-sm font-medium">
                  {dayName(win.dayOfWeek)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {minutesToLabel(win.startMinute)} –{" "}
                  {minutesToLabel(win.endMinute)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(win.id)}
                aria-label={`Delete ${dayName(win.dayOfWeek)} window`}
              >
                <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Exceptions({ userId }: { readonly userId: string }) {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: exceptionsKey(userId),
    queryFn: () => availabilityService.listExceptionsForUser(userId),
  });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [available, setAvailable] = useState(false);
  const [reason, setReason] = useState("");

  const create = useMutation({
    mutationFn: (input: {
      type: "AVAILABLE" | "UNAVAILABLE";
      startsAt: string;
      endsAt: string;
      note?: string;
    }) => availabilityService.createException(userId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: exceptionsKey(userId) }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => availabilityService.deleteException(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: exceptionsKey(userId) }),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({
      type: available ? "AVAILABLE" : "UNAVAILABLE",
      startsAt: new Date(`${date}T00:00:00`).toISOString(),
      endsAt: new Date(`${date}T23:59:59`).toISOString(),
      note: reason.trim() || undefined,
    });
  };

  const items = list.data ?? [];

  return (
    <div className="border-border/60 bg-card/40 rounded-3xl border p-5">
      <h2 className="text-foreground text-lg font-semibold">One-off exceptions</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Mark a specific day as available or unavailable, e.g. for a doctor’s
        appointment or a one-time pickup shift.
      </p>

      <form
        onSubmit={onSubmit}
        className="border-border/60 mt-4 grid gap-3 rounded-2xl border bg-background/50 p-4 sm:grid-cols-[1fr_auto_2fr_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="exc-date">Date</Label>
          <Input
            id="exc-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={available}
              onCheckedChange={(value) => setAvailable(value === true)}
            />
            Available
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. doctor visit"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={create.isPending} className="w-full sm:w-auto">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </form>

      <ul className="mt-5 space-y-2">
        {list.isLoading ? (
          <li className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </li>
        ) : items.length === 0 ? (
          <li className="text-muted-foreground text-sm">No exceptions set.</li>
        ) : (
          items.map((exc) => (
            <li
              key={exc.id}
              className="border-border/60 flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div>
                <p className="text-foreground text-sm font-medium">
                  {new Date(exc.startsAt).toLocaleDateString()}{" "}
                  <span
                    className={
                      exc.type === "AVAILABLE"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }
                  >
                    · {exc.type === "AVAILABLE" ? "Available" : "Unavailable"}
                  </span>
                </p>
                {exc.note ? (
                  <p className="text-muted-foreground text-xs">{exc.note}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(exc.id)}
                aria-label="Delete exception"
              >
                <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

const hhmmToMin = (hhmm: string): number => {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
};
