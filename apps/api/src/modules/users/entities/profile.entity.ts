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
