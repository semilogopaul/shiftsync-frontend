"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import type { SessionUser } from "@/common/types/user";
import {
  authService,
  type LoginInput,
  type RegisterInput,
} from "../services/auth-service";

const SESSION_KEY = ["auth", "session"] as const;

export function useCurrentUser() {
  return useQuery<SessionUser | null>({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const setSession = (user: SessionUser | null) =>
    queryClient.setQueryData(SESSION_KEY, user);

  const login = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (user) => {
      setSession(user);
      router.push("/dashboard");
    },
  });

  const register = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (user) => {
      setSession(user);
      router.push("/dashboard");
    },
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setSession(null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const forgotPassword = useMutation({
    mutationFn: (email: string) => authService.forgotPassword({ email }),
  });

  const resetPassword = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword({ token, newPassword: password }),
    onSuccess: () => {
      router.push("/login?reset=1");
    },
  });

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
}
