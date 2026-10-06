import {
    Entity,
    Check,
    Column,
    CreateDateColumn,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { Post } from './post.entity.js'

// One rating per user per post. The unique index leads with postId, so it also serves postId lookups.
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
}
