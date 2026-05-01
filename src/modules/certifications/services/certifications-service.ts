import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api-client";
import type { SkillRef, UserSummary, Location } from "@/common/types/domain";

/**
 * Mirror of the backend `CertificationWithRelations` shape returned from the
 * `/certifications/*` endpoints. The relations the UI actually reads — user,
 * location, and skills — are pulled out as typed fields so the
 * grant/revoke/list flows can render names without a second roundtrip.
 *
 * Soft-delete: when a certification is revoked the row is preserved with a
 * non-null `decertifiedAt` so historical assignments remain explicable. The
 * BE endpoints filter these out by default; pass `includeHistory=true` to
 * get them.
 */
export interface Certification {
  readonly id: string;
  readonly userId: string;
  readonly user?: UserSummary;
  readonly locationId: string;
  readonly location?: Location;
  readonly certifiedAt: string;
  readonly decertifiedAt: string | null;
  readonly expiresAt: string | null;
  readonly notes: string | null;
  readonly skills: readonly { readonly skill: SkillRef }[];
}

export interface GrantCertificationInput {
  readonly userId: string;
  readonly locationId: string;
  readonly skillIds: readonly string[];
  readonly expiresAt?: string;
  readonly notes?: string;
}

export interface UpdateCertificationInput {
  readonly skillIds?: readonly string[];
  /** `null` clears, `undefined` leaves untouched. */
  readonly expiresAt?: string | null;
  readonly notes?: string | null;
}

interface ListQuery {
  readonly includeHistory?: boolean;
}

const cleanParams = (input: object) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const certificationsService = {
  listForUser: (userId: string, params: ListQuery = {}) =>
    apiGet<Certification[]>(`/certifications/user/${userId}`, {
      params: cleanParams(params),
    }),
  listForLocation: (locationId: string, params: ListQuery = {}) =>
    apiGet<Certification[]>(`/certifications/location/${locationId}`, {
      params: cleanParams(params),
    }),
  grant: (input: GrantCertificationInput) =>
    apiPost<Certification, GrantCertificationInput>("/certifications", input),
  update: (id: string, input: UpdateCertificationInput) =>
    apiPatch<Certification, UpdateCertificationInput>(
      `/certifications/${id}`,
      input,
    ),
  revoke: (id: string) => apiDelete<Certification>(`/certifications/${id}`),
} as const;
