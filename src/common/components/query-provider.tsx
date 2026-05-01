"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

const buildClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });

let browserClient: QueryClient | null = null;
const getClient = (): QueryClient => {
  if (isServer) {
    return buildClient();
  }
  if (!browserClient) {
    browserClient = buildClient();
  }
  return browserClient;
};

export function QueryProvider({ children }: { readonly children: ReactNode }) {
  const client = getClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
