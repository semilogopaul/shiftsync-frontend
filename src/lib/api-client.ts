'use client';

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

/**
 * Shape of a structured API error envelope produced by the NestJS backend.
 * The backend's GlobalExceptionFilter normalises errors so the frontend can
 * always rely on `code` and `message`.
 */
export interface ApiErrorBody {
  readonly statusCode: number;
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.statusCode = body.statusCode;
    this.code = body.code;
    this.details = body.details;
  }
}

const buildClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true, // cookie-based auth
    timeout: 20_000,
  });

  // ── Silent access-token refresh on 401 ──────────────────────────────────────
  // Access cookie expires after 15 min; refresh cookie lasts 7 days. When a
  // protected request returns 401 we transparently call /auth/refresh and
  // replay the original request. Concurrent 401s share the same refresh promise
  // so we only hit /refresh once.
  let refreshInflight: Promise<void> | null = null;
  const tryRefresh = async (): Promise<void> => {
    if (!refreshInflight) {
      refreshInflight = axios
        .post(`${env.apiBaseUrl}/auth/refresh`, {}, { withCredentials: true })
        .then(() => undefined)
        .finally(() => {
          refreshInflight = null;
        });
    }
    return refreshInflight;
  };

  instance.interceptors.response.use(
    (response) => {
      // Some callers (e.g. the audit log paginated table) need the full
      // `{items, total, page, pageSize, totalPages}` envelope, not just the
      // items array. Honour `config.meta.skipAutoUnwrap === true` as an
      // opt-out: peel only the outer `{data}` wrapper and return the inner
      // object as-is.
      const meta = (response.config as { meta?: { skipAutoUnwrap?: boolean } }).meta;
      if (meta?.skipAutoUnwrap) {
        const body = response.data;
        if (
          body &&
          typeof body === 'object' &&
          !Array.isArray(body) &&
          'data' in (body as object)
        ) {
          response.data = (body as { data: unknown }).data;
        }
        return response;
      }
      // Auto-unwrap backend envelopes:
      //   { data: T }                          → T  (single resource)
      //   { items: T[], total, page, ... }    → T[] (paginated list)
      const body = response.data;
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        // Step 1: peel the outer {data: ...} wrapper if present
        let inner: unknown = body;
        if ('data' in (body as object)) {
          inner = (body as { data: unknown }).data;
        }
        // Step 2: if the result is a paginated envelope {items: T[], ...}, extract items
        if (
          inner &&
          typeof inner === 'object' &&
          !Array.isArray(inner) &&
          'items' in (inner as object) &&
          Array.isArray((inner as { items: unknown }).items)
        ) {
          response.data = (inner as { items: unknown }).items;
        } else {
          response.data = inner;
        }
      }
      return response;
    },
    async (error: unknown) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        const original = error.config as
          | (AxiosRequestConfig & { _retry?: boolean; url?: string })
          | undefined;
        const url = original?.url ?? '';
        // Don't try to refresh on the auth endpoints themselves — those 401s
        // are real (bad credentials, expired refresh, logged out).
        const isAuthEndpoint =
          url.includes('/auth/login') ||
          url.includes('/auth/refresh') ||
          url.includes('/auth/logout');
        if (original && !original._retry && !isAuthEndpoint) {
          original._retry = true;
          try {
            await tryRefresh();
            return instance.request(original);
          } catch {
            // fall through to throw the original 401
          }
        }
      }
      if (error instanceof AxiosError && error.response?.data) {
        const body = error.response.data as Partial<ApiErrorBody>;
        throw new ApiError({
          statusCode: body.statusCode ?? error.response.status,
          message: body.message ?? error.message,
          code: body.code,
          details: body.details,
        });
      }
      if (error instanceof AxiosError) {
        throw new ApiError({
          statusCode: error.response?.status ?? 0,
          message: error.message,
        });
      }
      throw error;
    },
  );

  return instance;
};

export const api = buildClient();

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  (await api.get<T>(url, config)).data;

export const apiPost = async <T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> => (await api.post<T>(url, body, config)).data;

export const apiPatch = async <T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> => (await api.patch<T>(url, body, config)).data;

export const apiPut = async <T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> => (await api.put<T>(url, body, config)).data;

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  (await api.delete<T>(url, config)).data;

/**
 * Paginated list envelope as returned by the backend. Use {@link apiGetPage}
 * when you need the totals/page metadata (e.g. for a paginated table); the
 * default {@link apiGet} auto-unwraps to just `T[]`.
 */
export interface PageResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export const apiGetPage = async <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PageResponse<T>> =>
  (
    await api.get<PageResponse<T>>(url, {
      ...config,
      // Tells the response interceptor to skip the items[] unwrap so we
      // can read total/page/pageSize for pagination controls.
      meta: { ...((config as { meta?: object })?.meta ?? {}), skipAutoUnwrap: true },
    } as AxiosRequestConfig)
  ).data;
