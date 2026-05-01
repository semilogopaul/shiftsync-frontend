import { apiGet } from "@/lib/api-client";
import type { UserSummary } from "@/common/types/domain";

export const usersService = {
  /**
   * Light-weight directory listing — available to any authenticated user.
   * Use `locationId` to find staff certified at a specific location (e.g.
   * candidates for a swap recipient). Hard-capped at 50 rows on the server.
   */
  directory: (params?: { role?: string; locationId?: string; search?: string }) =>
    apiGet<UserSummary[]>("/users/directory", { params }),
  get: (id: string) => apiGet<UserSummary>(`/users/${id}`),
} as const;
