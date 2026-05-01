import {
  apiDelete,
  apiGetPage,
  apiPatch,
  apiPost,
  type PageResponse,
} from "@/lib/api-client";
import type { UserSummary } from "@/common/types/domain";
import type { UserRole } from "@/common/types/user";

export interface AdminUserListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly role?: UserRole;
  readonly search?: string;
  readonly isActive?: boolean;
}

export interface AdminUser extends UserSummary {
  readonly phone?: string | null;
  readonly emailVerified?: boolean;
  readonly isActive?: boolean;
  readonly preferredTimezone?: string | null;
  readonly notifyInApp?: boolean;
  readonly notifyEmail?: boolean;
  readonly createdAt?: string;
}

export interface AdminCreateUserInput {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly role: UserRole;
}

export const usersAdminService = {
  /**
   * Paginated admin user list. Returns the full envelope so the table can
   * render totals + page controls (mirrors the backend `buildPaginatedResult`
   * shape).
   */
  list: (params?: AdminUserListParams): Promise<PageResponse<AdminUser>> =>
    apiGetPage<AdminUser>("/users", { params }),

  create: (input: AdminCreateUserInput): Promise<AdminUser> =>
    apiPost<AdminUser, AdminCreateUserInput>("/users", input),

  changeRole: (id: string, role: UserRole): Promise<AdminUser> =>
    apiPatch<AdminUser, { role: UserRole }>(`/users/${id}/role`, { role }),

  setActive: (id: string, isActive: boolean): Promise<AdminUser> =>
    apiPatch<AdminUser, { isActive: boolean }>(`/users/${id}/active`, {
      isActive,
    }),

  remove: (id: string): Promise<void> => apiDelete<void>(`/users/${id}`),
} as const;
