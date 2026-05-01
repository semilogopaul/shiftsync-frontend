"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  shiftsService,
  type AssignInput,
  type CreateShiftInput,
  type ListShiftsParams,
} from "../services/shifts-service";
import { messageFromError } from "@/common/utils/error-message";

export function useShifts(params: ListShiftsParams) {
  return useQuery({
    queryKey: ["shifts", params],
    queryFn: () => shiftsService.list(params),
  });
}

export function useShift(id: string | null) {
  return useQuery({
    queryKey: ["shifts", "detail", id],
    queryFn: () => shiftsService.get(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useShiftMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateShiftInput) => shiftsService.create(input),
      onSuccess: () => { invalidate(); toast.success('Shift created'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not create shift')),
    }),
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: Partial<CreateShiftInput>;
      }) => shiftsService.update(id, input),
      onSuccess: () => { invalidate(); toast.success('Shift updated'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not update shift')),
    }),
    publish: useMutation({
      mutationFn: (id: string) => shiftsService.publish(id),
      onSuccess: () => { invalidate(); toast.success('Shift published'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not publish shift')),
    }),
    publishMany: useMutation({
      mutationFn: (shiftIds: readonly string[]) =>
        shiftsService.publishMany(shiftIds),
      onSuccess: () => { invalidate(); toast.success('Week published'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not publish shifts')),
    }),
    unpublish: useMutation({
      mutationFn: (id: string) => shiftsService.unpublish(id),
      onSuccess: () => { invalidate(); toast.success('Shift unpublished'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not unpublish shift')),
    }),
    assign: useMutation({
      mutationFn: ({ shiftId, input }: { shiftId: string; input: AssignInput }) =>
        shiftsService.assign(shiftId, input),
      onSuccess: () => { invalidate(); toast.success('Staff assigned'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not assign staff')),
    }),
    unassign: useMutation({
      mutationFn: ({
        shiftId,
        userId,
      }: {
        shiftId: string;
        userId: string;
      }) => shiftsService.unassign(shiftId, userId),
      onSuccess: () => { invalidate(); toast.success('Staff removed from shift'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not remove staff')),
    }),
    callout: useMutation({
      mutationFn: ({ shiftId, reason }: { shiftId: string; reason: string }) =>
        shiftsService.callout(shiftId, reason),
      onSuccess: () => { invalidate(); toast.success('Callout submitted'); },
      onError: (err) => toast.error(messageFromError(err, 'Could not submit callout')),
    }),
    clockIn: useMutation({
      mutationFn: (shiftId: string) => shiftsService.clockIn(shiftId),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ["on-duty"] });
        toast.success('Clocked in');
      },
      onError: (err) => toast.error(messageFromError(err, 'Could not clock in')),
    }),
    clockOut: useMutation({
      mutationFn: (shiftId: string) => shiftsService.clockOut(shiftId),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ["on-duty"] });
        toast.success('Clocked out');
      },
      onError: (err) => toast.error(messageFromError(err, 'Could not clock out')),
    }),
  };
}
