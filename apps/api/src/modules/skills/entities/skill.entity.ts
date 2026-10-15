import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

// What a skill is, not where it's used. Engines count as frameworks; apps, services and datastores as platforms.
export const SKILL_KINDS = ['language', 'framework', 'platform', 'discipline'] as const
export type SkillKind = (typeof SKILL_KINDS)[number]

// A closed catalog owned by the skills module: rows come from seeds, users only pick existing ones.
// Posts and users link to a skill by id only (post_skills, user_skills).
// Kind is varchar plus a check rather than a pg enum, so changing the list is a one-line migration.
@Entity('skills')
@Check(`"kind" IN ('language', 'framework', 'platform', 'discipline')`)
export class Skill {
    @PrimaryGeneratedColumn('uuid')
    id: string

    // URL key, e.g. 'nextjs', 'csharp', 'cplusplus'
    @Column({ type: 'varchar', length: 64, unique: true })
    slug: string

    // Display spelling, e.g. 'Next.js'
    @Column({ type: 'varchar', length: 64 })
    name: string

    @Column({ type: 'varchar', length: 20 })
    kind: SkillKind

    // Extra search terms for the picker, e.g. 'js' finds JavaScript and 'cpp' finds C++
    @Column('text', { array: true, default: '{}' })
    aliases: string[]

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
