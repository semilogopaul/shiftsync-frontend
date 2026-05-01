import { apiGet } from "@/lib/api-client";
import type { SkillRef } from "@/common/types/domain";

export const skillsService = {
  list: () => apiGet<SkillRef[]>("/skills"),
} as const;
