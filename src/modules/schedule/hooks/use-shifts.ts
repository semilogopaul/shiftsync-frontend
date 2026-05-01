"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  shiftsService,
  type AssignInput,
  type CreateShiftInput,
  type ListShiftsParams,
} from "../services/shifts-service";

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
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: Partial<CreateShiftInput>;
      }) => shiftsService.update(id, input),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: (id: string) => shiftsService.publish(id),
      onSuccess: invalidate,
    }),
    publishMany: useMutation({
      mutationFn: (shiftIds: readonly string[]) =>
        shiftsService.publishMany(shiftIds),
      onSuccess: invalidate,
    }),
    unpublish: useMutation({
      mutationFn: (id: string) => shiftsService.unpublish(id),
      onSuccess: invalidate,
    }),
    assign: useMutation({
      mutationFn: ({ shiftId, input }: { shiftId: string; input: AssignInput }) =>
        shiftsService.assign(shiftId, input),
      onSuccess: invalidate,
    }),
    unassign: useMutation({
      mutationFn: ({
        shiftId,
        userId,
      }: {
        shiftId: string;
        userId: string;
      }) => shiftsService.unassign(shiftId, userId),
      onSuccess: invalidate,
    }),
    callout: useMutation({
      mutationFn: ({ shiftId, reason }: { shiftId: string; reason: string }) =>
        shiftsService.callout(shiftId, reason),
      onSuccess: invalidate,
    }),
    clockIn: useMutation({
      mutationFn: (shiftId: string) => shiftsService.clockIn(shiftId),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ["on-duty"] });
      },
    }),
    clockOut: useMutation({
      mutationFn: (shiftId: string) => shiftsService.clockOut(shiftId),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ["on-duty"] });
      },
    }),
  };
}
