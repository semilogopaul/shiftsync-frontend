export const USER_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly notifyInApp: boolean;
  readonly notifyEmail: boolean;
  readonly desiredWeeklyHours: number | null;
}
