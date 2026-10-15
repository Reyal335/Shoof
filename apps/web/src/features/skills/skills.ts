import { SKILL_KINDS, type CatalogSkill, type Skill, type SkillKind } from "./types";

/** Rules for showing and picking skills. Pure: no React, no DOM. */

export const KIND_LABELS: Record<SkillKind, string> = {
  language: "Languages",
  framework: "Frameworks",
  platform: "Platforms",
  discipline: "Disciplines",
};

/** The kinds that have at least one skill, in SKILL_KINDS order, each with its skills sorted by name. */
export function groupByKind<T extends Skill>(skills: T[]): { kind: SkillKind; skills: T[] }[] {
  return SKILL_KINDS.map((kind) => ({
    kind,
    skills: skills.filter((s) => s.kind === kind).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((group) => group.skills.length > 0);
}

/** Lowercase letters and digits only, the way slugs are written: "Next.js" and "next js" both give "nextjs". */
const compact = (text: string) => text.toLowerCase().replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/[^a-z0-9]/g, "");

/**
 * Catalog skills matching what the user typed, best first: an exact name, slug or alias, then names that start with
 * it, then any word, slug or alias that does. "ts" finds TypeScript, "design" finds UI Design, "c#" finds C#.
 */
export function matchSkills(catalog: CatalogSkill[], typed: string, limit = 8): CatalogSkill[] {
  const term = typed.trim().toLowerCase();
  const key = compact(term);
  if (!term || !key) return [];

  const ranked: { skill: CatalogSkill; rank: number }[] = [];
  for (const skill of catalog) {
    const name = skill.name.toLowerCase();
    const keys = [skill.slug, ...skill.aliases].map(compact);
    let rank = -1;
    if (name === term || keys.includes(key)) rank = 0;
    else if (name.startsWith(term)) rank = 1;
    else if (name.split(/[\s/.-]+/).some((word) => word.startsWith(term)) || keys.some((k) => k.startsWith(key))) rank = 2;
    if (rank > -1) ranked.push({ skill, rank });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.skill.name.localeCompare(b.skill.name))
    .slice(0, limit)
    .map((r) => r.skill);
}
