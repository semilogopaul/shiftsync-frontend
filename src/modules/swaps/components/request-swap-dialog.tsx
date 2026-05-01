'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationFindingsList } from '@/common/components/validation-findings-list';
import { formatTimeRange } from '@/common/utils/datetime';
import type { Shift, UserSummary } from '@/common/types/domain';
import { usersService } from '@/modules/users/services/users-service';
import { useSwapMutations, usePendingCounts } from '../hooks/use-swaps';

interface Props {
  readonly shift: Shift;
  readonly currentUserId: string;
  readonly onClose: () => void;
}

const MAX_PENDING = 3;

/**
 * Staff request a 1:1 swap with a specific colleague. Backend re-validates the
 * recipient against rules (skill, location cert, rest, etc.) and surfaces any
 * blockers via E_VALIDATION — we render those with ValidationFindingsList.
 *
 * Recipient list is pre-filtered to users with the same skill and location
 * certification, but the BE remains the source of truth.
 */
export function RequestSwapDialog({ shift, currentUserId, onClose }: Props) {
  const swapMutations = useSwapMutations();
  const pending = usePendingCounts();

  const [toUserId, setToUserId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const candidates = useQuery({
    queryKey: ['users', { locationId: shift.locationId }],
    queryFn: () => usersService.directory({ locationId: shift.locationId }),
  });

  const eligible = useMemo(() => {
    if (!candidates.data) return [];
    return candidates.data.filter((user: UserSummary) => {
      if (user.id === currentUserId) return false;
      if (user.role !== 'EMPLOYEE' && user.role !== 'MANAGER') return false;
      if (shift.skillId) {
        const has = user.skills?.some((s) => s.id === shift.skillId);
        if (!has) return false;
      }
      const certified = user.certifiedLocationIds?.includes(shift.locationId);
      if (certified === false) return false;
      return true;
    });
  }, [candidates.data, currentUserId, shift.locationId, shift.skillId]);

  const atLimit =
    typeof pending.data?.total === 'number' &&
    typeof pending.data?.limit === 'number' &&
    pending.data.total >= pending.data.limit;
  const limit = pending.data?.limit ?? MAX_PENDING;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!toUserId || atLimit) return;
    swapMutations.create.mutate(
      { shiftId: shift.id, toUserId, reason: reason.trim() || undefined },
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
            <h2 className="text-xl font-semibold tracking-tight">Request swap</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatTimeRange(shift.startsAt, shift.endsAt, shift.location?.timezone ?? 'UTC')} ·{' '}
              {shift.location?.name ?? '—'}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        {atLimit ? (
          <div className="border-destructive/40 bg-destructive/10 text-destructive mt-4 rounded-lg border px-3 py-2 text-sm">
            You already have {limit} pending requests. Resolve one before sending another.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="swap-recipient">Send to</Label>
            <select
              id="swap-recipient"
              value={toUserId}
              onChange={(event) => setToUserId(event.target.value)}
              required
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              disabled={candidates.isLoading || atLimit}
            >
              <option value="">Choose a colleague…</option>
              {eligible.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            {!candidates.isLoading && eligible.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No eligible colleagues found at this location with the required skill.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="swap-reason">Reason (optional)</Label>
            <Input
              id="swap-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. doctor's appointment"
              maxLength={280}
            />
          </div>

          <ValidationFindingsList
            error={swapMutations.create.error}
            fallback="Could not send swap request."
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!toUserId || atLimit || swapMutations.create.isPending}>
              {swapMutations.create.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
