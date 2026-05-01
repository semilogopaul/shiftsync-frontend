import { apiDelete, apiGet, apiPost, apiPatch } from "@/lib/api-client";
import type {
  AssignmentPreview,
  AuditLogEntry,
  Shift,
} from "@/common/types/domain";

export interface ListShiftsParams {
  readonly locationId?: string;
  readonly userId?: string;
  readonly status?: string;
  readonly from?: string;
  readonly to?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CreateShiftInput {
  readonly locationId: string;
  readonly skillId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly headcount: number;
  readonly notes?: string | null;
}

export interface AssignInput {
  readonly userId: string;
  readonly overrideUsed?: boolean;
  readonly overrideReason?: string;
}

export interface PublishResult {
  readonly publishedIds: readonly string[];
}

export const shiftsService = {
  list: (params?: ListShiftsParams) =>
    apiGet<Shift[]>("/shifts", { params }),
  get: (id: string) => apiGet<Shift>(`/shifts/${id}`),
  create: (input: CreateShiftInput) =>
    apiPost<Shift, CreateShiftInput>("/shifts", input),
  update: (id: string, input: Partial<CreateShiftInput>) =>
    apiPatch<Shift, Partial<CreateShiftInput>>(`/shifts/${id}`, input),
  publish: (id: string) =>
    apiPost<PublishResult, { shiftIds: string[] }>(
      `/shifts/publish`,
      { shiftIds: [id] },
    ),
  /**
   * Bulk publish — used by the "Publish week" CTA on the schedule view.
   * Backend silently skips shifts that are already published or that the
   * actor is not allowed to manage; the response only lists the ids that
   * were actually transitioned, which lets the UI report `published / total`.
   */
  publishMany: (shiftIds: readonly string[]) =>
    apiPost<PublishResult, { shiftIds: readonly string[] }>(
      `/shifts/publish`,
      { shiftIds },
    ),
  unpublish: (id: string) => apiPost<Shift>(`/shifts/${id}/unpublish`),
  previewAssignment: (id: string, input: AssignInput) =>
    apiPost<AssignmentPreview, AssignInput>(
      `/shifts/${id}/assignments/preview`,
      input,
    ),
  assign: (id: string, input: AssignInput) =>
    apiPost<Shift, AssignInput>(`/shifts/${id}/assignments`, input),
  unassign: (shiftId: string, userId: string) =>
    apiDelete<Shift>(`/shifts/${shiftId}/assignments/${userId}`),
  callout: (shiftId: string, reason: string) =>
    apiPost<Shift, { reason: string }>(`/shifts/${shiftId}/callout`, { reason }),
  history: (shiftId: string) =>
    apiGet<AuditLogEntry[]>(`/shifts/${shiftId}/history`),
  clockIn: (shiftId: string) => apiPost<Shift, {}>(`/shifts/${shiftId}/clock-in`, {}),
  clockOut: (shiftId: string) => apiPost<Shift, {}>(`/shifts/${shiftId}/clock-out`, {}),
} as const;
