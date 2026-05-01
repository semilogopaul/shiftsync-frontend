"use client";

import { useQuery } from "@tanstack/react-query";
import { skillsService } from "./services/skills-service";

export const useSkills = () =>
  useQuery({
    queryKey: ["skills"],
    queryFn: skillsService.list,
    staleTime: 5 * 60_000,
  });

export { skillsService } from "./services/skills-service";
