"use client";

import Link from "next/link";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  Clock3,
  Loader2,
  Repeat,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/common/utils/datetime";
import type { NotificationItem } from "@/common/types/domain";
import { useNotifications } from "../hooks/use-notifications";

/** Resolves a deep-link target from the notification's payload. */
function deepLink(item: NotificationItem): string | null {
  const payload = item.payload ?? {};
  const shiftId = typeof payload.shiftId === "string" ? payload.shiftId : null;
  const swapId = typeof payload.swapId === "string" ? payload.swapId : null;
  const dropId = typeof payload.dropId === "string" ? payload.dropId : null;
  if (swapId || dropId) return `/swaps`;
  if (shiftId) return `/schedule?shiftId=${shiftId}`;
  return null;
}

function iconFor(type: string) {
  if (type.startsWith("SWAP")) return Repeat;
  if (type.startsWith("DROP")) return Repeat;
  if (type.includes("OVERTIME")) return ShieldAlert;
  if (type.includes("CALLOUT")) return ShieldAlert;
  if (type.includes("CLOCK")) return Clock3;
  if (type.includes("PUBLISH") || type.includes("SHIFT")) return CalendarClock;
  if (type.includes("PREMIUM")) return Sparkles;
  return Bell;
}

export function NotificationsList() {
  const { list, markRead, markAllRead } = useNotifications();
  const items = list.data ?? [];
  const hasUnread = items.some((item) => !item.readAt);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Schedule changes, swaps, and overtime warnings live here.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
          Mark all read
        </Button>
      </header>

      {list.isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-12">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="border-border/60 bg-card/50 flex flex-col items-center gap-3 rounded-3xl border py-16 text-center">
          <Bell className="text-muted-foreground h-8 w-8" aria-hidden="true" />
          <div>
            <p className="text-foreground text-sm font-medium">All caught up</p>
            <p className="text-muted-foreground mt-1 text-xs">
              You’ll see new schedule changes and approvals here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="border-border/60 bg-card/40 divide-border/60 divide-y overflow-hidden rounded-3xl border">
          {items.map((item) => {
            const unread = !item.readAt;
            const Icon = iconFor(item.type);
            const href = deepLink(item);
            const Body = (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    "border-border/60 bg-muted/40 mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    unread ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {item.body}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {formatRelative(item.createdAt)}
                  </p>
                </div>
              </>
            );
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-4 p-5 transition-colors",
                  unread ? "bg-primary/5" : "bg-transparent",
                )}
              >
                {href ? (
                  <Link
                    href={href}
                    onClick={() => {
                      if (unread) markRead.mutate(item.id);
                    }}
                    className="hover:bg-accent/40 -m-2 flex flex-1 items-start gap-4 rounded-xl p-2 transition-colors"
                  >
                    {Body}
                  </Link>
                ) : (
                  <div className="flex flex-1 items-start gap-4">{Body}</div>
                )}
                {unread ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead.mutate(item.id)}
                  >
                    Mark read
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
