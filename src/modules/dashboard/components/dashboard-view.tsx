'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/modules/auth';
import { useShifts, weekContaining } from '@/modules/schedule';
import { useSwaps } from '@/modules/swaps';
import { useNotifications } from '@/modules/notifications';
import { apiGet } from '@/lib/api-client';
import type { OvertimeReport } from '@/modules/analytics/services/analytics-service';
import { formatDayLabel, formatTimeRange } from '@/common/utils/datetime';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
    queryKey: ['analytics', 'overtime', 'current-week'],
    queryFn: () =>
      apiGet<OvertimeReport>('/analytics/overtime', {
        params: { weekContaining: range.start.toISOString() },
      }),
    enabled: user?.role === 'ADMIN' || user?.role === 'MANAGER',
  });

  const myShifts = (shifts.data ?? []).filter((shift) =>
    shift.assignments.some((assignment) => assignment.userId === user?.id),
  );
  const upcoming = myShifts
    .filter((shift) => new Date(shift.startsAt) > new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 5);

  const pendingSwaps = (swaps.data ?? []).filter(
    (req) => req.status === 'PENDING_RECIPIENT' || req.status === 'PENDING_MANAGER',
  ).length;
  const overtimeFlags = (overtime.data?.staff ?? []).filter((row) => row.totalHours >= 35).length;

  const showOvertimeKpi = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Wait until every KPI query has data so the four cards reveal together,
  // not one-by-one as each individual fetch resolves.
  const kpisLoading =
    shifts.isLoading ||
    swaps.isLoading ||
    notifs.unreadCount.isLoading ||
    (showOvertimeKpi && overtime.isLoading);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greet(user?.firstName ?? 'there')}
        </h1>
        <p className="text-muted-foreground text-sm">Here’s what’s happening across your week.</p>
      </header>

      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2',
          user?.role === 'EMPLOYEE' ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        )}
      >
        <KpiCard
          label="Your shifts this week"
          value={kpisLoading ? null : String(myShifts.length)}
          accent="primary"
        />
        <KpiCard
          label="Pending swaps"
          value={kpisLoading ? null : String(pendingSwaps)}
          accent="amber"
        />
        <KpiCard
          label="Unread alerts"
          value={kpisLoading ? null : String(notifs.unreadCount.data?.unread ?? 0)}
          accent="sky"
        />
        {user?.role !== 'EMPLOYEE' ? (
          <KpiCard
            label="Approaching OT"
            value={kpisLoading ? null : String(overtimeFlags)}
            accent="fuchsia"
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="border-border/60 bg-card/40 lg:col-span-2 rounded-3xl border p-5">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your upcoming shifts</h2>
            <Link href="/schedule" className="text-primary text-xs font-medium hover:underline">
              See schedule
            </Link>
          </header>
          {shifts.isLoading ? (
            <ul className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={`sk-${i}`}>
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </li>
              ))}
            </ul>
          ) : upcoming.length === 0 ? (
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
                      {shift.location?.name ?? '—'}
                      {shift.isPremium ? (
                        <Sparkles
                          className="ml-1.5 inline h-3 w-3 text-fuchsia-500"
                          aria-label="Premium shift"
                        />
                      ) : null}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDayLabel(shift.startsAt, shift.location?.timezone ?? 'UTC')} ·{' '}
                      {formatTimeRange(
                        shift.startsAt,
                        shift.endsAt,
                        shift.location?.timezone ?? 'UTC',
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
            {user?.role !== 'EMPLOYEE' ? (
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
  readonly label: string;
  readonly value: string | null;
  readonly accent: 'primary' | 'amber' | 'sky' | 'fuchsia';
}

function KpiCard({ label, value, accent }: KpiProps) {
  if (value === null) {
    return <Skeleton className="h-28 w-full rounded-3xl" />;
  }
  return (
    <div
      className={cn(
        'rounded-3xl border p-5 shadow-sm transition-colors',
        accent === 'primary' && 'border-primary/20 bg-primary/10',
        accent === 'amber' && 'border-amber-500/20 bg-amber-500/10',
        accent === 'sky' && 'border-sky-500/20 bg-sky-500/10',
        accent === 'fuchsia' && 'border-fuchsia-500/20 bg-fuchsia-500/10',
      )}
    >
      <p
        className={cn(
          'mb-2 text-xs font-bold uppercase tracking-wider',
          accent === 'primary' && 'text-primary',
          accent === 'amber' && 'text-amber-700 dark:text-amber-400',
          accent === 'sky' && 'text-sky-700 dark:text-sky-400',
          accent === 'fuchsia' && 'text-fuchsia-700 dark:text-fuchsia-400',
        )}
      >
        {label}
      </p>
      {value === null ? null : (
        <p className="text-foreground text-4xl font-extrabold tracking-tight">{value}</p>
      )}
    </div>
  );
}

function ActionRow({ href, label }: { readonly href: string; readonly label: string }) {
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
