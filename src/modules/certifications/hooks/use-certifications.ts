"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  certificationsService,
  type GrantCertificationInput,
  type UpdateCertificationInput,
} from "../services/certifications-service";

export function useCertificationsForUser(
  userId: string | null | undefined,
  includeHistory = false,
) {
  return useQuery({
    queryKey: ["certifications", "user", userId, includeHistory],
    queryFn: () =>
      certificationsService.listForUser(userId ?? "", { includeHistory }),
    enabled: Boolean(userId),
  });
}

export function useCertificationsForLocation(
  locationId: string | null | undefined,
  includeHistory = false,
) {
  return useQuery({
    queryKey: ["certifications", "location", locationId, includeHistory],
    queryFn: () =>
      certificationsService.listForLocation(locationId ?? "", { includeHistory }),
    enabled: Boolean(locationId),
  });
}

export function useCertificationMutations() {
  const queryClient = useQueryClient();
  // Any cert change can shift who is assignable where, so invalidate the
  // certs cache plus any list (shifts/users) that might filter on it.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["certifications"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  return {
    grant: useMutation({
      mutationFn: (input: GrantCertificationInput) =>
        certificationsService.grant(input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: UpdateCertificationInput;
      }) => certificationsService.update(id, input),
      onSuccess: invalidate,
    }),
    revoke: useMutation({
      mutationFn: (id: string) => certificationsService.revoke(id),
      onSuccess: invalidate,
    }),
  };
}
