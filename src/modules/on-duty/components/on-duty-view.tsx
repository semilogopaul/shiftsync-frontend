'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/api-client';
import { useLocations } from '@/modules/locations';
import { formatTimeRange, formatRelative } from '@/common/utils/datetime';
import type { Shift } from '@/common/types/domain';

interface OnDutyEntry {
  readonly clockEventId: string;
  readonly shiftId: string;
  readonly userId: string;
  readonly occurredAt: string;
  readonly shift: Shift;
  readonly user: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

const onDutyService = {
  list: (locationId?: string) =>
    apiGet<OnDutyEntry[]>('/on-duty', {
      params: locationId ? { locationId } : undefined,
    }),
};

export function OnDutyView() {
  const { data: locations = [] } = useLocations();
  const [locationId, setLocationId] = useState<string | 'all'>('all');

  const query = useQuery({
    queryKey: ['on-duty', locationId],
    queryFn: () => onDutyService.list(locationId === 'all' ? undefined : locationId),
    // Realtime: invalidated automatically by the socket bridge on
    // shift.assigned / shift.unassigned / clock.in / clock.out.
    refetchOnWindowFocus: true,
  });

  const items = query.data ?? [];
  const grouped = locations.map((loc) => ({
    location: loc,
    entries: items.filter((entry) => entry.shift.locationId === loc.id),
  }));

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">On duty now</h1>
          <p className="text-muted-foreground text-sm">
            Live across every location. Updates without refresh.
          </p>
        </div>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger className="w-48">
            <SelectValue />
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
      </header>

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border-border/60 bg-card/40 flex flex-col items-center gap-3 rounded-3xl border py-16 text-center">
          <Activity className="text-muted-foreground h-8 w-8" aria-hidden="true" />
          <p className="text-foreground text-sm font-medium">Nobody clocked in right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {grouped
            .filter((group) => group.entries.length > 0)
            .map((group) => (
              <div
                key={group.location.id}
                className="border-border/60 bg-card/40 rounded-3xl border p-5"
              >
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-4 w-4" aria-hidden="true" />
                    <h2 className="text-foreground text-base font-semibold">
                      {group.location.name}
                    </h2>
                  </div>
                  <span className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    {group.entries.length} on duty
                  </span>
                </header>
                <ul className="mt-4 space-y-2">
                  {group.entries.map((entry) => (
                    <li
                      key={`${entry.shift.id}-${entry.userId}`}
                      className="border-border/40 flex items-center justify-between gap-3 rounded-xl border p-3"
                    >
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {entry.user.firstName} {entry.user.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatTimeRange(
                            entry.shift.startsAt,
                            entry.shift.endsAt,
                            entry.shift.location?.timezone ?? 'UTC',
                          )}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        clocked in {formatRelative(entry.occurredAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
