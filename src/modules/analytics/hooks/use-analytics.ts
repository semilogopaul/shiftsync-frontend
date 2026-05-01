"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics-service";

interface BaseParams {
  readonly locationId?: string;
}

const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
};

export const useOvertime = (params: BaseParams = {}) => {
  const weekContaining = startOfWeek(new Date()).toISOString();
  const merged = { ...params, weekContaining };
  return useQuery({
    queryKey: ["analytics", "overtime", merged],
    queryFn: () => analyticsService.overtime(merged),
  });
};

export const useDistribution = (params: BaseParams = {}) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);
  const merged = {
    ...params,
    start: start.toISOString(),
    end: end.toISOString(),
  };
  return useQuery({
    queryKey: ["analytics", "distribution", merged],
    queryFn: () => analyticsService.distribution(merged),
  });
};
