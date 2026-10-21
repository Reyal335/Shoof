import {
    Entity,
    Check,
    Column,
    CreateDateColumn,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { Post } from './post.entity.js'

// One rating per user per post, 1 to 5 whole stars. "Not rated" is no row, never a 0. Rating again replaces the value.
// The unique index leads with postId, so it also serves every per-post read (summary, distribution, recompute)
// and no separate postId index is needed.
@Entity('ratings')
@Index(['postId', 'userId'], { unique: true })
@Check(`"value" BETWEEN 1 AND 5`)
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('uuid')
    postId: string

    @ManyToOne(() => Post, (post) => post.ratings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Relation<Post>

    // The rater's id only, no relation into the users tables
    @Index()
    @Column('uuid')
    userId: string

    @Column('smallint')
    value: number

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    // When the value last changed. RatingsService sets it in its upsert, which bypasses the entity listeners.
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
}
