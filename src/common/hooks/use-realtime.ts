"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { env } from "@/config/env";
import { useCurrentUser } from "@/modules/auth";

// Connection state, exposed to any component via useRealtimeStatus().
export type RealtimeStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline";
let currentStatus: RealtimeStatus = "idle";
const statusListeners = new Set<() => void>();
const setStatus = (next: RealtimeStatus) => {
  if (currentStatus === next) return;
  currentStatus = next;
  for (const fn of statusListeners) fn();
};
const subscribeStatus = (fn: () => void) => {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
};
export function useRealtimeStatus(): RealtimeStatus {
  return useSyncExternalStore(
    subscribeStatus,
    () => currentStatus,
    () => "idle",
  );
}

/**
 * Single shared socket connection. Mounted once at the app root via
 * <RealtimeBridge/>. Listens for backend events and:
 *   1. Invalidates matching React Query keys so any consumer page picks up
 *      fresh data automatically (no more 30s polling).
 *   2. Surfaces user-facing toasts for the events that matter to the actor
 *      (notifications, swaps targeted at me, my shift was assigned/changed,
 *      a drop I requested expired, etc.).
 *
 * Connection details:
 *   - Targets `${env.realtimeUrl}/realtime` (matches NestJS gateway namespace).
 *   - Sends the auth cookie via `withCredentials`. Falls back to `transports`
 *     starting with websocket then long-polling so it works behind proxies
 *     that strip Upgrade headers.
 *   - Auto-reconnects (default behaviour). On reconnect we invalidate
 *     everything to recover any deltas missed while offline.
 */

interface NotificationPayload {
  readonly id?: string;
  readonly title?: string;
  readonly body?: string;
  readonly type?: string;
}

interface ShiftEventPayload {
  readonly shiftId?: string;
  readonly userId?: string;
  readonly locationId?: string;
}

interface SwapEventPayload {
  readonly swapId?: string;
  readonly shiftId?: string;
  readonly fromUserId?: string;
  readonly toUserId?: string;
}

interface DropEventPayload {
  readonly dropId?: string;
  readonly shiftId?: string;
  readonly fromUserId?: string;
  readonly claimedById?: string;
}

export function useRealtime() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const socket = io(`${env.realtimeUrl}/realtime`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });
    socketRef.current = socket;
    setStatus("connecting");

    // ─── Cache invalidations ──────────────────────────────────────────
    const invalidateShifts = () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["on-duty"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    };
    const invalidateSwaps = () => {
      queryClient.invalidateQueries({ queryKey: ["swaps"] });
      queryClient.invalidateQueries({ queryKey: ["open-drops"] });
      queryClient.invalidateQueries({ queryKey: ["pending-counts"] });
    };
    const invalidateNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    const invalidateAvailability = () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    };

    // On reconnect, refetch everything that may have changed while offline.
    socket.on("connect", () => {
      setStatus("connected");
      // Fire all on first connect AND on reconnects.
      invalidateShifts();
      invalidateSwaps();
      invalidateNotifications();
    });
    socket.on("disconnect", () => setStatus("offline"));
    socket.io.on("reconnect_attempt", () => setStatus("reconnecting"));
    socket.on("connect_error", () => setStatus("offline"));

    // ─── Notifications ────────────────────────────────────────────────
    socket.on("notification", (payload: NotificationPayload) => {
      invalidateNotifications();
      if (payload?.title) {
        toast(payload.title, { description: payload.body });
      }
    });

    // ─── Shifts ───────────────────────────────────────────────────────
    socket.on("shift.assigned", (p: ShiftEventPayload) => {
      invalidateShifts();
      if (p.userId === userId) {
        toast.success("You were assigned a new shift");
      }
    });
    socket.on("shift.unassigned", (p: ShiftEventPayload) => {
      invalidateShifts();
      if (p.userId === userId) {
        toast("You were removed from a shift");
      }
    });
    socket.on("shift.published", () => {
      invalidateShifts();
      toast("Schedule published");
    });
    socket.on("shift.updated", invalidateShifts);
    socket.on("shift.deleted", invalidateShifts);
    socket.on("shift.callout", () => {
      invalidateShifts();
      invalidateSwaps();
      toast("A shift opened up — check open drops");
    });
    socket.on("assignment.conflict", (p: ShiftEventPayload) => {
      invalidateShifts();
      if (p.userId === userId) {
        toast.error("Assignment conflict — please reload", {
          description:
            "Another manager updated this shift. Latest data has been loaded.",
        });
      }
    });

    // ─── Swaps (wildcard from gateway routes specific events to user rooms) ─
    const onSwapEvent = (eventName: string) => (p: SwapEventPayload) => {
      invalidateSwaps();
      const isRecipient = p.toUserId === userId;
      const isRequester = p.fromUserId === userId;
      if (eventName === "swap.requested" && isRecipient) {
        toast("Someone wants to swap with you");
      } else if (eventName === "swap.approved" && (isRequester || isRecipient)) {
        toast.success("Swap approved");
      } else if (eventName === "swap.rejected" && isRequester) {
        toast.error("Your swap request was rejected");
      } else if (eventName === "swap.recipient.rejected" && isRequester) {
        toast.error("Swap declined by the recipient");
      } else if (eventName === "swap.auto.cancelled" && isRequester) {
        toast.error("Your swap was auto-cancelled");
      }
    };
    [
      "swap.requested",
      "swap.recipient.accepted",
      "swap.recipient.rejected",
      "swap.approved",
      "swap.rejected",
      "swap.cancelled",
      "swap.auto.cancelled",
    ].forEach((name) => socket.on(name, onSwapEvent(name)));

    // ─── Drops ────────────────────────────────────────────────────────
    const onDropEvent = (eventName: string) => (p: DropEventPayload) => {
      invalidateSwaps();
      const isRequester = p.fromUserId === userId;
      const isClaimer = p.claimedById === userId;
      if (eventName === "drop.claimed" && isRequester) {
        toast("Someone claimed your dropped shift");
      } else if (eventName === "drop.approved" && (isRequester || isClaimer)) {
        toast.success("Drop approved");
      } else if (eventName === "drop.rejected" && (isRequester || isClaimer)) {
        toast.error("Drop request rejected");
      } else if (eventName === "drop.expired" && isRequester) {
        toast("Your drop request expired");
      }
    };
    [
      "drop.requested",
      "drop.claimed",
      "drop.approved",
      "drop.rejected",
      "drop.cancelled",
      "drop.expired",
    ].forEach((name) => socket.on(name, onDropEvent(name)));

    // ─── Clock ────────────────────────────────────────────────────────
    socket.on("clock.in", () => {
      queryClient.invalidateQueries({ queryKey: ["on-duty"] });
    });
    socket.on("clock.out", () => {
      queryClient.invalidateQueries({ queryKey: ["on-duty"] });
    });

    // ─── Other ────────────────────────────────────────────────────────
    socket.on("overtime.warning", (p: { userId?: string }) => {
      if (p.userId === userId) {
        toast.warning("Overtime warning", {
          description: "You are approaching your weekly limit.",
        });
      }
    });
    socket.on("availability.changed", invalidateAvailability);

    socket.on("error", (err: { code?: string }) => {
      if (err?.code === "UNAUTHENTICATED") {
        // Silent — auth layer will redirect.
        return;
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setStatus("idle");
    };
  }, [user, queryClient]);

  return socketRef;
}

export function RealtimeBridge() {
  useRealtime();
  return null;
}

