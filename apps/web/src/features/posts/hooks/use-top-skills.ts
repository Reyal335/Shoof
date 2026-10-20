"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopSkills } from "../api";
import { postKeys } from "../queries";
import type { PostCategory } from "../types";

/** The skills a section's posts (or all posts) are built with most, busiest first. For the filter chips. */
export function useTopSkills(category?: PostCategory, limit = 8) {
  const query = useQuery({
    queryKey: postKeys.topSkills(category),
    queryFn: () => getTopSkills(category, limit),
    // Only moves when people post, so a few minutes stale is fine
    staleTime: 5 * 60_000,
  });
  return query.data ?? [];
}
