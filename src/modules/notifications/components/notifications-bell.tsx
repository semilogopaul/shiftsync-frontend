"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationsBell() {
  const { unreadCount } = useNotifications();
  const count = unreadCount.data?.unread ?? 0;

  return (
    <Button
      asChild
      type="button"
      variant="ghost"
      size="icon"
      aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
      className="relative"
    >
      <Link href="/notifications">
        <Bell className="h-5 w-5" aria-hidden="true" />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
