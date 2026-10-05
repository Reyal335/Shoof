import { 
    Entity, 
    Column, 
    CreateDateColumn, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn, 
    JoinColumn,
    OneToOne
} from 'typeorm'
import type { Relation } from 'typeorm'
import { User } from './user.entity.js'

@Entity()
export class User_Identity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => User, (user) => user.identity, {
        onDelete: "CASCADE"
    })
    @JoinColumn()
    user: Relation<User>
}