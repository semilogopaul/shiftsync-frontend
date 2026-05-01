import { apiGet, apiPost } from "@/lib/api-client";
import type { SwapRequest } from "@/common/types/domain";

export interface CreateSwapInput {
  readonly shiftId: string;
  readonly toUserId: string;
  readonly reason?: string;
}

export interface CreateDropInput {
  readonly shiftId: string;
  readonly reason?: string;
}

/** Counts the actor's currently-pending swaps + drops, plus the policy cap. */
export interface PendingCounts {
  readonly pendingSwaps: number;
  readonly pendingDrops: number;
  readonly total: number;
  readonly limit: number;
}

export const swapsService = {
  list: () => apiGet<SwapRequest[]>("/swaps/me"),
  listOpenDrops: () => apiGet<SwapRequest[]>("/drops/open"),
  pendingCounts: () => apiGet<PendingCounts>("/swaps/me/pending-count"),
  createSwap: (input: CreateSwapInput) =>
    apiPost<SwapRequest, CreateSwapInput>("/swaps", input),
  createDrop: (input: CreateDropInput) =>
    apiPost<SwapRequest, CreateDropInput>("/drops", input),
  acceptSwap: (id: string) => apiPost<SwapRequest>(`/swaps/${id}/accept`),
  rejectSwap: (id: string) => apiPost<SwapRequest>(`/swaps/${id}/reject`),
  approveSwap: (id: string) =>
    apiPost<SwapRequest>(`/swaps/${id}/manager-approve`),
  cancelSwap: (id: string) => apiPost<SwapRequest>(`/swaps/${id}/cancel`),
  claimDrop: (id: string) => apiPost<SwapRequest>(`/drops/${id}/claim`),
  approveDrop: (id: string) =>
    apiPost<SwapRequest>(`/drops/${id}/manager-approve`),
  cancelDrop: (id: string) => apiPost<SwapRequest>(`/drops/${id}/cancel`),
} as const;
