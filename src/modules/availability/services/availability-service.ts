import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import type {
  AvailabilityException,
  AvailabilityWindow,
} from "@/common/types/domain";

export interface CreateWindowInput {
  readonly dayOfWeek: number;
  readonly startMinute: number;
  readonly endMinute: number;
  readonly timezone: string;
}

export interface CreateExceptionInput {
  readonly type: "AVAILABLE" | "UNAVAILABLE";
  readonly startsAt: string;
  readonly endsAt: string;
  readonly note?: string;
}

export const availabilityService = {
  listForUser: (userId: string) =>
    apiGet<AvailabilityWindow[]>(`/availability/user/${userId}`),
  listExceptionsForUser: (userId: string) =>
    apiGet<AvailabilityException[]>(
      `/availability/user/${userId}/exceptions`,
    ),
  createWindow: (userId: string, input: CreateWindowInput) =>
    apiPost<AvailabilityWindow, CreateWindowInput>(
      `/availability/user/${userId}`,
      input,
    ),
  deleteWindow: (id: string) =>
    apiDelete<{ ok: true }>(`/availability/${id}`),
  createException: (userId: string, input: CreateExceptionInput) =>
    apiPost<AvailabilityException, CreateExceptionInput>(
      `/availability/user/${userId}/exceptions`,
      input,
    ),
  deleteException: (id: string) =>
    apiDelete<{ ok: true }>(`/availability/exceptions/${id}`),
} as const;
