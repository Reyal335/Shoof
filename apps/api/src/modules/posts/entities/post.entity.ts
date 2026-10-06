import {
    Entity,
    Column,
    CreateDateColumn,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { Media } from './media.entity.js'
import { Comment } from './comment.entity.js'
import { Rating } from './rating.entity.js'

// One per Shoof section page. Don't add or rename values without checking the web app.
export enum PostCategory {
    GAMES = 'games',
    PORTFOLIOS = 'portfolios',
    SAAS = 'saas',
    CSS_UI = 'css_ui',
    MISC = 'misc'
}

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string

    // The owner. Users are owned by the users module, so this holds the id only (same as refresh_tokens).
    @Index()
    @Column('uuid')
    userId: string

    @Column({ type: 'varchar', length: 150 })
    caption: string

    @Column('text')
    description: string

    @Column('varchar')
    link: string

    @Column({ type: 'varchar', nullable: true })
    repoUrl: string | null

    @Column('text', { array: true, default: '{}' })
    techStack: string[]

    @Column({ type: 'enum', enum: PostCategory })
    category: PostCategory

    // Average of this post's ratings, recomputed by the service. pg returns numerics as strings.
    @Column({
        type: 'decimal',
        precision: 2,
        scale: 1,
        default: 0,
        transformer: { to: (value: number) => value, from: (value: string) => Number(value) }
    })
    rating: number

    @Column({ type: 'int', default: 0 })
    ratingCount: number

    @Column({ type: 'int', default: 0 })
    visitCount: number

    @OneToMany(() => Media, (media) => media.post)
    media: Relation<Media[]>

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Relation<Comment[]>

    @OneToMany(() => Rating, (rating) => rating.post)
    ratings: Relation<Rating[]>

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
}
