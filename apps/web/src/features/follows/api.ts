import { request } from "@/lib/api-client";
import { authedRequest } from "@/features/auth/authed-request";
import type { FollowCounts } from "@/features/profile/types";

/** GET /users/:id/follow: whether the signed-in user follows :id. */
export type FollowStatus = { following: boolean };

const followPath = (userId: string) => `/users/${encodeURIComponent(userId)}/follow`;

export const getFollowStatus = (userId: string) => authedRequest<FollowStatus>(followPath(userId));

/** Both are idempotent on the API: following twice or unfollowing someone you don't follow is a no-op. */
export const followUser = (userId: string) => authedRequest<void>(followPath(userId), { method: "POST" });
export const unfollowUser = (userId: string) => authedRequest<void>(followPath(userId), { method: "DELETE" });

/** The Followers and Following numbers on a profile. Public. */
export const getFollowCounts = (username: string) =>
  request<FollowCounts>(`/users/${encodeURIComponent(username)}/follow-counts`);
