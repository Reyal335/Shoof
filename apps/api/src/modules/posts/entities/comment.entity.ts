import {
    Entity,
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

// Flat comments only, no replies
@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column('uuid')
    postId: string

    @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Relation<Post>

    // The author's id only, no relation into the users tables
    @Index()
    @Column('uuid')
    userId: string

    @Column('text')
    content: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
}
