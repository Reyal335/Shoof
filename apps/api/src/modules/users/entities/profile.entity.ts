import {
    Entity,
    Column,
    CreateDateColumn,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { User } from './user.entity.js'

export interface ProfileLink {
    label: string
    url: string
}

// The groups shown on the profile page. Don't add or rename one without a migration for the stored rows.
export const TECH_STACK_GROUPS = ['frontend', 'backend', 'tools'] as const
export type TechStackGroup = (typeof TECH_STACK_GROUPS)[number]
export type TechStack = Record<TechStackGroup, string[]>

export const emptyTechStack = (): TechStack => ({ frontend: [], backend: [], tools: [] })

// Public-facing data for a user. Kept apart from `user` so auth fields never leak into profile queries.
@Entity('profiles')
export class Profile {
    @PrimaryColumn('uuid')
    userId: string

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: Relation<User>

    @Column({ type: 'varchar', length: 80 })
    displayName: string

    @Column({ type: 'text', nullable: true })
    bio: string | null

    @Column({ type: 'varchar', nullable: true })
    avatarUrl: string | null

    @Column({ type: 'varchar', nullable: true })
    websiteUrl: string | null

    // GitHub, Behance, etc.
    @Column({ type: 'jsonb', default: () => `'[]'` })
    links: ProfileLink[]

    // What the creator builds with, grouped for display. Free-text names (like posts.techStack) until a skills
    // module exists; written by UsersService.updateProfile only, which keeps every group present and deduplicated.
    // The default is spelled the way Postgres prints jsonb (keys reordered) so migration:generate sees no change.
    @Column({ type: 'jsonb', default: () => `'{"tools": [], "backend": [], "frontend": []}'` })
    techStack: TechStack

    // ISO 3166-1 alpha-2
    @Column({ type: 'char', length: 2, nullable: true })
    country: string | null

    // BCP 47, e.g. en-US
    @Column({ type: 'varchar', length: 10, nullable: true })
    locale: string | null

    // IANA name, e.g. Asia/Manila
    @Column({ type: 'varchar', length: 64, nullable: true })
    timezone: string | null

    // ISO 4217
    @Column({ type: 'char', length: 3, nullable: true })
    currency: string | null

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
}
