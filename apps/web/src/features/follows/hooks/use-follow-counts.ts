"use client";

import { useQuery } from "@tanstack/react-query";
import type { FollowCounts } from "@/features/profile/types";
import { getFollowCounts } from "../api";
import { followKeys } from "../queries";

/**
 * A profile's Followers and Following numbers. `initial` is what the server rendered; the numbers refetch after the
 * viewer follows or unfollows anyone.
 */
export function useFollowCounts(username: string, initial?: FollowCounts) {
  const query = useQuery({
    queryKey: followKeys.countsOf(username),
    queryFn: () => getFollowCounts(username),
    initialData: initial,
    enabled: !!username,
  });
  return query.data;
}
