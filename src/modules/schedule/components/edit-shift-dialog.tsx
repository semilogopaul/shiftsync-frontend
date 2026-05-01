'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationFindingsList } from '@/common/components/validation-findings-list';
import { formatTimeRange, isOvernight, wallTimeInZoneToUtcIso } from '@/common/utils/datetime';
import type { Shift } from '@/common/types/domain';
import { useShiftMutations } from '../hooks/use-shifts';

interface Props {
  readonly shift: Shift;
  readonly onClose: () => void;
}

const shiftDateByDays = (isoDate: string, days: number): string => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};

const isoDateInZone = (iso: string, tz: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
  return parts;
};

const isoTimeInZone = (iso: string, tz: string): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
  return parts.replace(/[^0-9:]/g, '');
};

/**
 * Edit an existing shift. Mirrors CreateShiftDialog but uses the shift's
 * existing location timezone for wall-clock conversion. Issuing PATCH cancels
 * any pending swaps for this shift on the backend (handled via event), so we
 * surface that consequence in the help text.
 */
export function EditShiftDialog({ shift, onClose }: Props) {
  const mutations = useShiftMutations();
  const tz = shift.location?.timezone ?? 'UTC';

  const [date, setDate] = useState(() => isoDateInZone(shift.startsAt, tz));
  const [startTime, setStartTime] = useState(() => isoTimeInZone(shift.startsAt, tz));
  const [endTime, setEndTime] = useState(() => isoTimeInZone(shift.endsAt, tz));
  const [headcount, setHeadcount] = useState(shift.headcount);
  const [notes, setNotes] = useState(shift.notes ?? '');

  const overnight = isOvernight(startTime, endTime);
  const preview = useMemo(() => {
    try {
      const startsAt = wallTimeInZoneToUtcIso(date, startTime, tz);
      const endDate = overnight ? shiftDateByDays(date, 1) : date;
      const endsAt = wallTimeInZoneToUtcIso(endDate, endTime, tz);
      return {
        startsAt,
        endsAt,
        label: formatTimeRange(startsAt, endsAt, tz),
      };
    } catch {
      return null;
    }
  }, [date, startTime, endTime, overnight, tz]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preview) return;
    mutations.update.mutate(
      {
        id: shift.id,
        input: {
          startsAt: preview.startsAt,
          endsAt: preview.endsAt,
          headcount,
          notes: notes.trim() || null,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="bg-background/80 absolute inset-0 backdrop-blur-sm"
      />
      <div className="bg-card border-border/60 absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Edit shift</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Editing will cancel any pending swap or drop requests for this shift.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start</Label>
              <Input
                id="edit-start"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End</Label>
              <Input
                id="edit-end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-headcount">Headcount</Label>
            <Input
              id="edit-headcount"
              type="number"
              min={1}
              value={headcount}
              onChange={(event) => setHeadcount(Math.max(1, Number(event.target.value)))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
            />
          </div>

          {preview ? (
            <p className="border-border/60 bg-muted/40 text-muted-foreground rounded-lg border px-3 py-2 text-xs">
              Will save as {preview.label} ({tz}){overnight ? ' — overnight, ends next day' : ''}
            </p>
          ) : null}

          <ValidationFindingsList
            error={mutations.update.error}
            fallback="Could not update shift."
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!preview || mutations.update.isPending}>
              {mutations.update.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
