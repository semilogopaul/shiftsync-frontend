'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { dayName, minutesToLabel } from '@/common/utils/datetime';
import { messageFromError } from '@/common/utils/error-message';
import { useCurrentUser } from '@/modules/auth';
import { toast } from 'sonner';
import { availabilityService } from '../services/availability-service';

const windowsKey = (uid: string) => ['availability', 'windows', uid] as const;
const exceptionsKey = (uid: string) => ['availability', 'exceptions', uid] as const;

export function AvailabilityView() {
  const { data: user } = useCurrentUser();
  if (!user) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="text-muted-foreground text-sm">
          Recurring weekly windows and one-off exceptions. Managers see this when they’re looking
          for coverage.
        </p>
      </header>

      <RecurringWindows userId={user.id} />
      <Exceptions userId={user.id} />
    </section>
  );
}

const browserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

function RecurringWindows({ userId }: { readonly userId: string }) {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: windowsKey(userId),
    queryFn: () => availabilityService.listForUser(userId),
  });
  const [day, setDay] = useState('1');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');

  const create = useMutation({
    mutationFn: (input: {
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      timezone: string;
    }) => availabilityService.createWindow(userId, input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: windowsKey(userId) }); toast.success('Availability window saved'); },
    onError: (err) => toast.error(messageFromError(err, 'Could not save window')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => availabilityService.deleteWindow(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: windowsKey(userId) }); toast.success('Window removed'); },
    onError: (err) => toast.error(messageFromError(err, 'Could not remove window')),
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
        className="border-border/60 mt-4 gap-3 rounded-2xl border bg-background/50 p-4 flex flex-col sm:grid sm:grid-cols-4 sm:items-end"
      >
        <div className="flex flex-col w-full min-w-0">
          <Label htmlFor="day" className="h-5">Day</Label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger id="day" className="h-10 w-full">
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
        <div className="flex flex-col w-full min-w-0">
          <Label htmlFor="start" className="h-5">Start</Label>
          <Input
            id="start"
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col w-full min-w-0">
          <Label htmlFor="end" className="h-5">End</Label>
          <Input
            id="end"
            type="time"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col justify-end">
          <Button type="submit" disabled={create.isPending} className="h-10 w-full">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        {create.error ? (
          <p className="text-destructive sm:col-span-4 text-xs">
            {messageFromError(create.error, 'Could not add window.')}
          </p>
        ) : null}
      </form>

      <div className="mt-5">
        {list.isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">You haven't added any weekly windows yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {items.map((win) => (
              <div
                key={win.id}
                className="border-border/60 bg-card/50 group relative rounded-lg border p-2 transition-colors hover:bg-card/80"
              >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-foreground text-xs font-semibold">{dayName(win.dayOfWeek)}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {minutesToLabel(win.startMinute)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {minutesToLabel(win.endMinute)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 h-6 w-6"
                  onClick={() => remove.mutate(win.id)}
                  aria-label={`Delete ${dayName(win.dayOfWeek)} window`}
                >
                  <Trash2 className="text-destructive h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  const [reason, setReason] = useState('');

  const create = useMutation({
    mutationFn: (input: {
      type: 'AVAILABLE' | 'UNAVAILABLE';
      startsAt: string;
      endsAt: string;
      note?: string;
    }) => availabilityService.createException(userId, input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: exceptionsKey(userId) }); toast.success('Exception saved'); },
    onError: (err) => toast.error(messageFromError(err, 'Could not save exception')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => availabilityService.deleteException(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: exceptionsKey(userId) }); toast.success('Exception removed'); },
    onError: (err) => toast.error(messageFromError(err, 'Could not remove exception')),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({
      type: 'UNAVAILABLE',
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
        Mark a specific day as unavailable, e.g. for a doctor&apos;s appointment or personal
        commitment.
      </p>

      <form
        onSubmit={onSubmit}
        className="border-border/60 mt-4 gap-3 rounded-2xl border bg-background/50 p-4 flex flex-col sm:grid sm:grid-cols-4 sm:items-end"
      >
        <div className="flex flex-col w-full min-w-0">
          <Label htmlFor="exc-date" className="h-5">Date</Label>
          <Input
            id="exc-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex flex-col w-full min-w-0 sm:col-span-2">
          <Label htmlFor="exc-reason" className="h-5">Reason (optional)</Label>
          <Input
            id="exc-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. doctor visit"
            className="h-10"
          />
        </div>
        <div className="flex flex-col w-full min-w-0">
          <Label className="invisible h-5" aria-hidden="true">
            Action
          </Label>
          <Button type="submit" disabled={create.isPending} className="h-10 w-full">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        {create.error ? (
          <p className="text-destructive sm:col-span-4 text-xs">
            {messageFromError(create.error, 'Could not add exception.')}
          </p>
        ) : null}
      </form>

      <ul className="mt-5 space-y-2">
        {list.isLoading ? (
          <>
            <li>
              <Skeleton className="h-12 w-full rounded-xl" />
            </li>
            <li>
              <Skeleton className="h-12 w-full rounded-xl" />
            </li>
          </>
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
                  {new Date(exc.startsAt).toLocaleDateString()}{' '}
                  <span className="inline-block bg-destructive/15 text-destructive rounded px-2 py-1 text-xs font-medium ml-2">Unavailable</span>
                </p>
                {exc.note ? <p className="text-muted-foreground text-xs mt-1">{exc.note}</p> : null}
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
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};
