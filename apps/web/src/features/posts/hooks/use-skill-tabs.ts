"use client";

import type { TabOption } from "@/components/tabs";
import type { PostCategory } from "../types";
import { useTopSkills } from "./use-top-skills";

/** The "All" tab's value. Any other value is a skill slug. */
export const ALL = "all";

/**
 * Filter tabs for a section page: "All" plus the skills the section's posts are built with most. `upper` matches
 * designs that set their tabs in capitals.
 */
export function useSkillTabs(category: PostCategory, { upper = false, limit = 6 } = {}): TabOption[] {
  const top = useTopSkills(category, limit);
  const label = (text: string) => (upper ? text.toUpperCase() : text);
  return [{ value: ALL, label: label("All") }, ...top.map(({ skill }) => ({ value: skill.slug, label: label(skill.name) }))];
}

/** The tab value as a list filter. */
export const skillFilter = (tab: string) => (tab === ALL ? undefined : tab);
