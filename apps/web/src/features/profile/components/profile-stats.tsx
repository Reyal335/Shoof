"use client";

import { useFollowCounts } from "@/features/follows/hooks/use-follow-counts";
import type { Page, Post } from "@/features/posts/types";
import type { FollowCounts } from "../types";
import { useProfileSites } from "./profile-sites";

/** Sites, Followers and Following. The follow numbers refetch whenever the viewer follows or unfollows someone. */
export function ProfileStats({ username, initialSites, initialCounts }: { username: string; initialSites?: Page<Post>; initialCounts?: FollowCounts }) {
  const sites = useProfileSites(username, initialSites);
  const counts = useFollowCounts(username, initialCounts);
  const show = (n: number | undefined) => (n === undefined ? "–" : n.toLocaleString("en-US"));

  return (
    <ul className="stats" aria-label="Profile stats">
      <li><b>{show(sites.isPending ? undefined : sites.total)}</b><span>Sites</span></li>
      <li><b>{show(counts?.followers)}</b><span>Followers</span></li>
      <li><b>{show(counts?.following)}</b><span>Following</span></li>
    </ul>
  );
}
