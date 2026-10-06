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
import { User } from './user.entity.js'

// A sign-in method linked to a user, e.g. a Google account. One user can have several.
@Entity()
@Index(['provider', 'providerUserId'], { unique: true })
export class User_Identity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column('uuid')
    userId: string

    @ManyToOne(() => User, (user) => user.identities, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: 'userId' })
    user: Relation<User>

    // e.g. 'google'
    @Column({ type: 'varchar', length: 40 })
    provider: string

    // The provider's stable subject id, never the email
    @Column({ type: 'varchar' })
    providerUserId: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
