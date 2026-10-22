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

    // Where the file sits in storage (posts/{userId}/{uuid}.png), not a URL. The URL depends on how media is served
    // (MEDIA_BASE_URL) and is built on read, so a CDN or storage move needs no data change.
    @Column('varchar')
    key: string

    @Column({ type: 'int', default: 0 })
    sortOrder: number

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
