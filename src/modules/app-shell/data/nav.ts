import {
  CalendarDays,
  ClipboardList,
  Clock,
  Gauge,
  LayoutDashboard,
  Repeat,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/common/types/user";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly roles: readonly UserRole[];
  readonly group: "main" | "admin";
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    group: "main",
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    group: "main",
  },
  {
    label: "Swaps & Drops",
    href: "/swaps",
    icon: Repeat,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    group: "main",
  },
  {
    label: "Availability",
    href: "/availability",
    icon: Clock,
    roles: ["EMPLOYEE", "MANAGER", "ADMIN"],
    group: "main",
  },
  {
    label: "On-duty now",
    href: "/on-duty",
    icon: Gauge,
    roles: ["MANAGER", "ADMIN"],
    group: "main",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: ClipboardList,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    group: "main",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: Gauge,
    roles: ["ADMIN", "MANAGER"],
    group: "admin",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
    group: "admin",
  },
  {
    label: "Certifications",
    href: "/admin/certifications",
    icon: ShieldCheck,
    roles: ["ADMIN", "MANAGER"],
    group: "admin",
  },
  {
    label: "Audit log",
    href: "/admin/audit",
    icon: ScrollText,
    roles: ["ADMIN"],
    group: "admin",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    group: "main",
  },
];

export const navItemsForRole = (role: UserRole): readonly NavItem[] =>
  NAV_ITEMS.filter((item) => item.roles.includes(role));
