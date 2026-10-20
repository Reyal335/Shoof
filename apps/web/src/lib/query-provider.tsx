"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "./api-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Lists and posts change slowly; this stops a refetch every time a component mounts
        staleTime: 30_000,
        // A 4xx (not found, not signed in, bad filter) won't change on a retry; network errors and 5xx might
        retry: (failures, error) => !(error instanceof ApiError && error.status < 500) && failures < 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// One client per server render, so requests never share data; one for the whole visit in the browser
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/** TanStack Query for server state. Rendered by SiteDocument, so every section page has it. */
export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
