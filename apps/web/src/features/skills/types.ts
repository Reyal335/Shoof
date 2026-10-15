// Mirrors the Skill entity in apps/api/src/modules/skills/entities/skill.entity.ts.

// Same kinds, in display order, as SKILL_KINDS in the API.
export const SKILL_KINDS = ["language", "framework", "platform", "discipline"] as const;
export type SkillKind = (typeof SKILL_KINDS)[number];

/** What posts and profiles send for a skill (SkillSummary in the API). */
export interface Skill {
  id: string;
  slug: string;
  name: string;
  kind: SkillKind;
}

/** A row of GET /skills: the summary plus the extra search terms, e.g. "js" for JavaScript. */
export interface CatalogSkill extends Skill {
  aliases: string[];
}
