import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { Relation } from 'typeorm'
import { User } from './user.entity.js'

// What a creator builds with, shown on their profile grouped by skill kind. Owned by the users module.
@Entity('user_skills')
@Index(['skillId', 'userId'])
export class UserSkill {
    @PrimaryColumn('uuid')
    userId: string

    // Skills are owned by the skills module, so this holds the id only
    @PrimaryColumn('uuid')
    skillId: string

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: Relation<User>
}
