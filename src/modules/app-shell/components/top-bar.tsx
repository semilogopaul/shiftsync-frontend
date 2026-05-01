"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/common/types/user";
import { useAuth } from "@/modules/auth";
import { NotificationsBell } from "@/modules/notifications/components/notifications-bell";
import { useRealtimeStatus } from "@/common/hooks/use-realtime";
import { navItemsForRole } from "../data/nav";

interface TopBarProps {
  readonly user: SessionUser;
}

export function TopBar({ user }: TopBarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItemsForRole(user.role);

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      <header className="border-border/60 bg-background/70 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        <div className="flex-1" />

        <ConnectionDot />
        <NotificationsBell />
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full"
              aria-label="Account menu"
            >
              <span className="from-primary to-fuchsia-500 text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold">
                {initials || "U"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-foreground truncate text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {mobileOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex lg:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="bg-background/80 absolute inset-0 backdrop-blur-sm"
          />
          <div className="bg-card relative flex w-72 flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Menu</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Tiny realtime indicator. Surfaces gateway connection state so users know
 * whether the page is hearing live updates. Green = connected, amber =
 * reconnecting, red = offline.
 */
function ConnectionDot() {
  const status = useRealtimeStatus();
  const { color, label } =
    status === "connected"
      ? { color: "bg-emerald-500", label: "Live updates: connected" }
      : status === "reconnecting" || status === "connecting"
        ? { color: "bg-amber-500 animate-pulse", label: "Live updates: reconnecting" }
        : status === "offline"
          ? { color: "bg-red-500", label: "Live updates: offline" }
          : { color: "bg-muted-foreground/40", label: "Live updates: idle" };
  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className="mr-1 inline-flex h-2 w-2 items-center justify-center"
    >
      <span className={cn("h-2 w-2 rounded-full", color)} />
    </span>
  );
}
