"use client";

import { useQuery } from "@tanstack/react-query";
import { locationsService } from "../services/locations-service";

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: locationsService.list,
    staleTime: 5 * 60_000,
  });
}
