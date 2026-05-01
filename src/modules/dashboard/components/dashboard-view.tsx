"use client";

import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Repeat,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/modules/auth";
import { useShifts, weekContaining } from "@/modules/schedule";
import { useSwaps } from "@/modules/swaps";
import { useNotifications } from "@/modules/notifications";
import { apiGet } from "@/lib/api-client";
import type { OvertimeReport } from "@/modules/analytics/services/analytics-service";
import {
  formatDayLabel,
  formatTimeRange,
} from "@/common/utils/datetime";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const { data: user } = useCurrentUser();
  const range = weekContaining(new Date());
  const shifts = useShifts({
    from: range.start.toISOString(),
    to: range.end.toISOString(),
  });
  const swaps = useSwaps();
  const notifs = useNotifications();

  const overtime = useQuery<OvertimeReport>({
    queryKey: ["analytics", "overtime", "current-week"],
    queryFn: () =>
      apiGet<OvertimeReport>("/analytics/overtime", {
        params: { weekContaining: range.start.toISOString() },
      }),
    enabled: user?.role === "ADMIN" || user?.role === "MANAGER",
  });

  const myShifts = (shifts.data ?? []).filter((shift) =>
    shift.assignments.some((assignment) => assignment.userId === user?.id),
  );
  const upcoming = myShifts
    .filter((shift) => new Date(shift.startsAt) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, 5);

  const pendingSwaps = (swaps.data ?? []).filter(
    (req) => req.status === "PENDING_RECIPIENT" || req.status === "PENDING_MANAGER",
  ).length;
  const overtimeFlags = (overtime.data?.staff ?? []).filter(
    (row) => row.totalHours >= 35,
  ).length;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greet(user?.firstName ?? "there")}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here’s what’s happening across your week.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
          label="Your shifts this week"
          value={String(myShifts.length)}
          accent="primary"
        />
        <KpiCard
          icon={<Repeat className="h-4 w-4" aria-hidden="true" />}
          label="Pending swaps"
          value={String(pendingSwaps)}
          accent="amber"
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" aria-hidden="true" />}
          label="Unread alerts"
          value={String(notifs.unreadCount.data?.unread ?? 0)}
          accent="sky"
        />
        {user?.role !== "EMPLOYEE" ? (
          <KpiCard
            icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
            label="Approaching OT"
            value={String(overtimeFlags)}
            accent="fuchsia"
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="border-border/60 bg-card/40 lg:col-span-2 rounded-3xl border p-5">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your upcoming shifts</h2>
            <Link
              href="/schedule"
              className="text-primary text-xs font-medium hover:underline"
            >
              See schedule
            </Link>
          </header>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground mt-6 text-sm">
              You’re clear for the rest of the week.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {upcoming.map((shift) => (
                <li
                  key={shift.id}
                  className="border-border/60 flex items-center justify-between gap-3 rounded-2xl border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {shift.location.name}
                      {shift.isPremium ? (
                        <Sparkles
                          className="ml-1.5 inline h-3 w-3 text-fuchsia-500"
                          aria-label="Premium shift"
                        />
                      ) : null}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDayLabel(shift.startsAt, shift.location.timezone)}{" "}
                      ·{" "}
                      {formatTimeRange(
                        shift.startsAt,
                        shift.endsAt,
                        shift.location.timezone,
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-border/60 bg-card/40 rounded-3xl border p-5">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <ActionRow href="/schedule" label="Open the week schedule" />
            <ActionRow href="/availability" label="Update my availability" />
            <ActionRow href="/swaps" label="Browse open drops" />
            {user?.role !== "EMPLOYEE" ? (
              <ActionRow href="/admin/analytics" label="Open analytics" />
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

const greet = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 18) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
};

interface KpiProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly accent: "primary" | "amber" | "sky" | "fuchsia";
}

function KpiCard({ icon, label, value, accent }: KpiProps) {
  return (
    <div className="border-border/60 bg-card/40 rounded-3xl border p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-lg",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            accent === "sky" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            accent === "fuchsia" && "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
          )}
        >
          {icon}
        </span>
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-foreground mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ActionRow({
  href,
  label,
}: {
  readonly href: string;
  readonly label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="border-border/40 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-between rounded-xl border p-3 transition-colors"
      >
        <span>{label}</span>
        <span className="text-muted-foreground text-xs">→</span>
      </Link>
    </li>
  );
}
