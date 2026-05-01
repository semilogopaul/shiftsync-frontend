"use client";

import type { ReactNode } from "react";
import { useCurrentUser } from "@/modules/auth";
import type { UserRole } from "@/common/types/user";

interface RoleGateProps {
  readonly allow: readonly UserRole[];
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Hides children when the current user's role is not in the allow-list. Used
 * for in-page permission checks (the auth gate runs in <AppShell/>).
 */
export function RoleGate({ allow, fallback = null, children }: RoleGateProps) {
  const { data: user } = useCurrentUser();
  if (!user || !allow.includes(user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
