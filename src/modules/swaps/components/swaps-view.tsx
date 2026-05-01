"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Repeat, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDayLabel, formatTimeRange, formatRelative } from "@/common/utils/datetime";
import { useCurrentUser } from "@/modules/auth";
import type { SwapRequest, SwapStatus } from "@/common/types/domain";
import { useOpenDrops, useSwapMutations, useSwaps } from "../hooks/use-swaps";

type Tab = "mine" | "open";

/**
 * Status → Tailwind tone. Includes drop-only statuses (OPEN, EXPIRED) cast
 * via index to keep this map compatible with both the SwapStatus union and
 * the runtime values returned for drop rows. Falls back gracefully when an
 * unknown status string appears (e.g. a future backend addition).
 */
const STATUS_TONE: Record<string, string> = {
  PENDING_RECIPIENT: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  PENDING_MANAGER: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  REJECTED_BY_RECIPIENT: "bg-destructive/10 text-destructive border-destructive/30",
  REJECTED_BY_MANAGER: "bg-destructive/10 text-destructive border-destructive/30",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/30",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  OPEN: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  EXPIRED: "bg-muted text-muted-foreground border-border",
};

const isPending = (s: SwapStatus | string) =>
  s === "PENDING_RECIPIENT" || s === "PENDING_MANAGER" || s === "OPEN";

/**
 * Small live-updating countdown for an open drop's auto-cancel deadline.
 * Re-renders every minute (cheaper than every second; deadline granularity
 * here is "hours-before-shift" so seconds aren't useful). Switches tone to
 * destructive in the final 2 hours, and shows "expired" once past.
 */
function DropExpiryBadge({ expiresAt }: { readonly expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(expiresAt).getTime();
  const diffMs = target - now;
  const expired = diffMs <= 0;
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const label = expired
    ? "expired"
    : hours > 0
      ? `${hours}h ${mins}m left`
      : `${mins}m left`;
  const tone = expired
    ? "bg-muted text-muted-foreground border-border"
    : minutes <= 120
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-muted/50 text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        tone,
      )}
      title={`Auto-cancels at ${new Date(expiresAt).toLocaleString()}`}
    >
      <Clock3 className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function SwapsView() {
  const { data: user } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("mine");
  const swaps = useSwaps();
  const openDrops = useOpenDrops();

  const isManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Swaps & Drops</h1>
        <p className="text-muted-foreground text-sm">
          Coverage requests across the team.
        </p>
      </header>

      <div className="border-border/60 inline-flex rounded-lg border p-1">
        <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
          My requests
        </TabButton>
        <TabButton active={tab === "open"} onClick={() => setTab("open")}>
          Open drops
        </TabButton>
      </div>

      {tab === "mine" ? (
        <RequestsList
          isLoading={swaps.isLoading}
          items={swaps.data ?? []}
          isManager={isManager}
          currentUserId={user?.id}
        />
      ) : (
        <RequestsList
          isLoading={openDrops.isLoading}
          items={openDrops.data ?? []}
          isManager={isManager}
          currentUserId={user?.id}
          openDropsView
        />
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

interface RequestsListProps {
  readonly items: readonly SwapRequest[];
  readonly isLoading: boolean;
  readonly isManager: boolean;
  readonly currentUserId?: string;
  readonly openDropsView?: boolean;
}

function RequestsList({
  items,
  isLoading,
  isManager,
  currentUserId,
  openDropsView,
}: RequestsListProps) {
  const m = useSwapMutations();

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-12">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-border/60 bg-card/40 flex flex-col items-center gap-3 rounded-3xl border py-16 text-center">
        <Repeat className="text-muted-foreground h-8 w-8" aria-hidden="true" />
        <p className="text-foreground text-sm font-medium">
          {openDropsView ? "No open drops right now." : "No swap or drop requests yet."}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((req) => {
        const isSwap = !!req.toUserId;
        const tz = req.shift?.location?.timezone ?? "UTC";
        return (
          <li
            key={req.id}
            className="border-border/60 bg-card/40 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    STATUS_TONE[req.status],
                  )}
                >
                  {req.status}
                </span>
                <span className="text-muted-foreground text-xs">
                  {isSwap ? "Swap" : "Drop"} · {formatRelative(req.createdAt)}
                </span>
                {!isSwap && req.expiresAt && (req.status as string) === "OPEN" ? (
                  <DropExpiryBadge expiresAt={req.expiresAt} />
                ) : null}
              </div>
              {req.shift ? (
                <>
                  <p className="text-foreground mt-2 text-sm font-medium">
                    {req.shift.location?.name} ·{" "}
                    {formatDayLabel(req.shift.startsAt, tz)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatTimeRange(req.shift.startsAt, req.shift.endsAt, tz)}
                  </p>
                </>
              ) : null}
              <p className="text-muted-foreground mt-1 text-xs">
                {req.fromUser
                  ? `${req.fromUser.firstName} ${req.fromUser.lastName}`
                  : "Requester"}
                {req.toUser
                  ? ` → ${req.toUser.firstName} ${req.toUser.lastName}`
                  : ""}
              </p>
              {req.reason ? (
                <p className="text-muted-foreground mt-2 text-sm italic">
                  “{req.reason}”
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Recipient actions: accept/reject pending swap targeted at me */}
              {isSwap &&
              req.status === "PENDING_RECIPIENT" &&
              req.toUserId === currentUserId ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => m.reject.mutate(req.id)}
                    disabled={m.reject.isPending}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => m.accept.mutate(req.id)}
                    disabled={m.accept.isPending}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Accept
                  </Button>
                </>
              ) : null}

              {/* Drop claim — anyone qualified */}
              {!isSwap &&
              isPending(req.status) &&
              req.fromUserId !== currentUserId &&
              !isManager ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => m.claim.mutate(req.id)}
                  disabled={m.claim.isPending}
                >
                  Claim shift
                </Button>
              ) : null}

              {/* Manager approval */}
              {isManager && req.status === "PENDING_MANAGER" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    isSwap
                      ? m.approveSwap.mutate(req.id)
                      : m.approveDrop.mutate(req.id)
                  }
                  disabled={m.approveSwap.isPending || m.approveDrop.isPending}
                >
                  Approve
                </Button>
              ) : null}

              {/* Requester cancel */}
              {req.fromUserId === currentUserId && isPending(req.status) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    isSwap
                      ? m.cancel.mutate(req.id)
                      : m.cancelDrop.mutate(req.id)
                  }
                  disabled={m.cancel.isPending || m.cancelDrop.isPending}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
