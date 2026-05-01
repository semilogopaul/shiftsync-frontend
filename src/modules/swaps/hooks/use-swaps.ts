"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { swapsService } from "../services/swaps-service";

export function useSwaps() {
  return useQuery({
    queryKey: ["swaps", "mine"],
    queryFn: swapsService.list,
  });
}

export function useOpenDrops() {
  return useQuery({
    queryKey: ["swaps", "open-drops"],
    queryFn: swapsService.listOpenDrops,
  });
}

/**
 * Counts of the actor's pending swap + drop requests, for the 3-pending
 * pre-flight check. Backed by `/swaps/me/pending-count`. Invalidated by the
 * realtime bridge whenever a swap/drop event fires (key: `pending-counts`).
 */
export function usePendingCounts() {
  return useQuery({
    queryKey: ["pending-counts"],
    queryFn: swapsService.pendingCounts,
  });
}

export function useSwapMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["swaps"] });
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    queryClient.invalidateQueries({ queryKey: ["pending-counts"] });
  };
  return {
    create: useMutation({
      mutationFn: swapsService.createSwap,
      onSuccess: invalidate,
    }),
    createDrop: useMutation({
      mutationFn: swapsService.createDrop,
      onSuccess: invalidate,
    }),
    accept: useMutation({
      mutationFn: (id: string) => swapsService.acceptSwap(id),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (id: string) => swapsService.rejectSwap(id),
      onSuccess: invalidate,
    }),
    approveSwap: useMutation({
      mutationFn: (id: string) => swapsService.approveSwap(id),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => swapsService.cancelSwap(id),
      onSuccess: invalidate,
    }),
    claim: useMutation({
      mutationFn: (id: string) => swapsService.claimDrop(id),
      onSuccess: invalidate,
    }),
    approveDrop: useMutation({
      mutationFn: (id: string) => swapsService.approveDrop(id),
      onSuccess: invalidate,
    }),
    cancelDrop: useMutation({
      mutationFn: (id: string) => swapsService.cancelDrop(id),
      onSuccess: invalidate,
    }),
  };
}
