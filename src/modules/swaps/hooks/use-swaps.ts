"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageFromError } from "@/common/utils/error-message";
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
      onSuccess: () => { invalidate(); toast.success('Swap request sent'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not request swap')),
    }),
    createDrop: useMutation({
      mutationFn: swapsService.createDrop,
      onSuccess: () => { invalidate(); toast.success('Shift dropped to open pool'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not drop shift')),
    }),
    accept: useMutation({
      mutationFn: (id: string) => swapsService.acceptSwap(id),
      onSuccess: () => { invalidate(); toast.success('Swap accepted — awaiting manager approval'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not accept swap')),
    }),
    reject: useMutation({
      mutationFn: (id: string) => swapsService.rejectSwap(id),
      onSuccess: () => { invalidate(); toast.success('Swap declined'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not decline swap')),
    }),
    approveSwap: useMutation({
      mutationFn: (id: string) => swapsService.approveSwap(id),
      onSuccess: () => { invalidate(); toast.success('Swap approved'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not approve swap')),
    }),
    cancel: useMutation({
      mutationFn: (id: string) => swapsService.cancelSwap(id),
      onSuccess: () => { invalidate(); toast.success('Swap request cancelled'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not cancel swap')),
    }),
    claim: useMutation({
      mutationFn: (id: string) => swapsService.claimDrop(id),
      onSuccess: () => { invalidate(); toast.success('Shift claimed — awaiting manager approval'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not claim shift')),
    }),
    approveDrop: useMutation({
      mutationFn: (id: string) => swapsService.approveDrop(id),
      onSuccess: () => { invalidate(); toast.success('Drop approved'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not approve drop')),
    }),
    cancelDrop: useMutation({
      mutationFn: (id: string) => swapsService.cancelDrop(id),
      onSuccess: () => { invalidate(); toast.success('Drop request cancelled'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not cancel drop')),
    }),
  };
}
