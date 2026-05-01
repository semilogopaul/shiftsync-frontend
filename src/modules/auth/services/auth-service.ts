import { apiGet, apiPost } from "@/lib/api-client";
import type { SessionUser } from "@/common/types/user";

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly acceptedTerms: true;
}

export interface ForgotPasswordInput {
  readonly email: string;
}

export interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
}

export const authService = {
  me: () => apiGet<SessionUser>("/auth/me"),
  login: (input: LoginInput) =>
    apiPost<SessionUser, LoginInput>("/auth/login", input),
  register: (input: RegisterInput) =>
    apiPost<SessionUser, RegisterInput>("/auth/register", input),
  logout: () => apiPost<{ ok: true }>("/auth/logout"),
  forgotPassword: (input: ForgotPasswordInput) =>
    apiPost<{ ok: true }, ForgotPasswordInput>("/auth/forgot-password", input),
  resetPassword: (input: ResetPasswordInput) =>
    apiPost<{ ok: true }, ResetPasswordInput>("/auth/reset-password", input),
} as const;
