import { cache } from "react";
import { ApiError, request } from "@/lib/api-client";
import type { PublicUser } from "./types";

/**
 * A creator's public profile, or null if the username doesn't exist. Server-only: called from the /@username page and
 * its generateMetadata, and `cache` makes those two share one API call per request.
 */
export const getPublicProfile = cache(async (username: string) => {
  try {
    return await request<PublicUser>(`/users/${encodeURIComponent(username)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
