import { apiGet } from "@/lib/api-client";
import type { Location } from "@/common/types/domain";

export const locationsService = {
  list: () => apiGet<Location[]>("/locations"),
  get: (id: string) => apiGet<Location>(`/locations/${id}`),
} as const;
