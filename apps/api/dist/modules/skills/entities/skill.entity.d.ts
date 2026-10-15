export declare const SKILL_KINDS: readonly ["language", "framework", "platform", "discipline"];
export type SkillKind = (typeof SKILL_KINDS)[number];
export declare class Skill {
    id: string;
    slug: string;
    name: string;
    kind: SkillKind;
    aliases: string[];
    createdAt: Date;
}
