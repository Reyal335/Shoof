import { cache } from "react";
import { ApiError, request } from "@/lib/api-client";
import { getFollowCounts } from "@/features/follows/api";
import { listPosts } from "@/features/posts/api";
import type { Page, Post } from "@/features/posts/types";
import { PROFILE_SITES_PAGE } from "./sites";
import type { FollowCounts, PublicUser } from "./types";

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

/**
 * The profile's numbers and first page of sites, for the server render. Either can be missing (API hiccup); the
 * page then loads it in the browser instead of failing.
 */
export async function getProfileActivity(username: string): Promise<{ counts?: FollowCounts; sites?: Page<Post> }> {
  const [counts, sites] = await Promise.allSettled([
    getFollowCounts(username),
    listPosts({ kind: "user", username }, {}, { limit: PROFILE_SITES_PAGE, offset: 0 }),
  ]);
  return {
    counts: counts.status === "fulfilled" ? counts.value : undefined,
    sites: sites.status === "fulfilled" ? sites.value : undefined,
  };
}
