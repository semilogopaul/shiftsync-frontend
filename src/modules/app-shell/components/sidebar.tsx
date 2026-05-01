"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/common/types/user";
import { navItemsForRole } from "../data/nav";

interface SidebarProps {
  readonly user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const items = navItemsForRole(user.role);
  const main = items.filter((item) => item.group === "main");
  const admin = items.filter((item) => item.group === "admin");

  return (
    <aside
      aria-label="Primary"
      className="border-border/60 bg-card/50 fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r backdrop-blur lg:flex"
    >
      <Link href="/dashboard" className="flex items-center px-6 py-5">
        <Image
          src="/logo/shiftsync-grey-logo.png"
          alt="ShiftSync"
          width={800}
          height={320}
          className="h-7 w-auto dark:hidden"
        />
        <Image
          src="/logo/shiftsync-white-logo.png"
          alt="ShiftSync"
          width={720}
          height={320}
          className="hidden h-7 w-auto dark:block"
        />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <NavGroup label="Workspace" items={main} pathname={pathname} />
        {admin.length > 0 ? (
          <NavGroup label="Administration" items={admin} pathname={pathname} className="mt-6" />
        ) : null}
      </nav>

      <div className="border-border/60 border-t px-4 py-3">
        <div className="bg-muted/40 rounded-xl p-3">
          <p className="text-foreground truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-muted-foreground truncate text-xs capitalize">
            {user.role?.toLowerCase() ?? ""}
          </p>
        </div>
      </div>
    </aside>
  );
}

interface NavGroupProps {
  readonly label: string;
  readonly items: readonly ReturnType<typeof navItemsForRole>[number][];
  readonly pathname: string | null;
  readonly className?: string;
}

function NavGroup({ label, items, pathname, className }: NavGroupProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground/80",
                  )}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
