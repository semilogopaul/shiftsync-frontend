"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationFindingsList } from "@/common/components/validation-findings-list";
import { formatTimeRange } from "@/common/utils/datetime";
import type { Shift } from "@/common/types/domain";
import { useSwapMutations, usePendingCounts } from "../hooks/use-swaps";

interface Props {
  readonly shift: Shift;
  readonly onClose: () => void;
}

const MAX_PENDING = 3;

/**
 * Drop a published shift into the open pool. Other eligible staff can claim it,
 * and a manager must approve. Per the brief, dropping within 24h of start is
 * discouraged but not blocked client-side — backend enforces the policy.
 */
export function DropShiftDialog({ shift, onClose }: Props) {
  const swapMutations = useSwapMutations();
  const pending = usePendingCounts();
  const [reason, setReason] = useState<string>("");

  const hoursUntilStart =
    (new Date(shift.startsAt).getTime() - Date.now()) / 3_600_000;
  const isUrgent = hoursUntilStart < 24;

  const atLimit =
    typeof pending.data?.total === "number" &&
    typeof pending.data?.limit === "number" &&
    pending.data.total >= pending.data.limit;
  const limit = pending.data?.limit ?? MAX_PENDING;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (atLimit) return;
    swapMutations.createDrop.mutate(
      { shiftId: shift.id, reason: reason.trim() || undefined },
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
            <h2 className="text-xl font-semibold tracking-tight">Drop shift</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatTimeRange(shift.startsAt, shift.endsAt, shift.location.timezone)} ·{" "}
              {shift.location.name}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        {isUrgent ? (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            This shift starts in less than 24 hours. Last-minute drops are discouraged and may
            require manager approval before someone can claim it.
          </div>
        ) : null}

        {atLimit ? (
          <div className="border-destructive/40 bg-destructive/10 text-destructive mt-4 rounded-lg border px-3 py-2 text-sm">
            You already have {limit} pending requests. Resolve one before sending another.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drop-reason">Reason</Label>
            <Input
              id="drop-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why are you dropping this shift?"
              maxLength={280}
            />
            <p className="text-muted-foreground text-xs">
              Visible to your manager and any colleague considering claiming it.
            </p>
          </div>

          <ValidationFindingsList
            error={swapMutations.createDrop.error}
            fallback="Could not drop the shift."
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={atLimit || swapMutations.createDrop.isPending}>
              {swapMutations.createDrop.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Drop shift
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
