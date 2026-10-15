import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { Relation } from 'typeorm'
import { Post } from './post.entity.js'

// What a post is built with. Owned by the posts module and written with the post.
@Entity('post_skills')
@Index(['skillId', 'postId'])
export class PostSkill {
    @PrimaryColumn('uuid')
    postId: string

    // Skills are owned by the skills module, so this holds the id only (same as posts.userId)
    @PrimaryColumn('uuid')
    skillId: string

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Relation<Post>
}
