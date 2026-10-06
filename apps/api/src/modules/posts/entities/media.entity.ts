import {
    Entity,
    Column,
    CreateDateColumn,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { Post } from './post.entity.js'

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video'
}

@Entity('post_media')
export class Media {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column('uuid')
    postId: string

    @ManyToOne(() => Post, (post) => post.media, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Relation<Post>

    @Column({ type: 'enum', enum: MediaType })
    type: MediaType

    @Column('varchar')
    url: string

    @Column({ type: 'int', default: 0 })
    sortOrder: number

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
