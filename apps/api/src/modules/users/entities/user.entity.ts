import { 
    Entity, 
    Column, 
    CreateDateColumn, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn, 
    OneToOne 
} from 'typeorm'
import type { Relation } from 'typeorm'
import { User_Identity } from './user-identity.js'

export enum UserRole {
    GUEST = "Guest",
    MEMBER = "Member",
    INFLUENCER = "Influencer",
    MODERATOR = "Moderator",
    ADMIN = "Admin"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type: "varchar",
        length: 150,
        unique: true
    })
    email: string
    
    @Column({
        type: "varchar",
        length: 150,
        unique: true
    })
    username: string

    @Column()
    passwordHash: string

    @Column({ default: true })
    isActive: boolean

    @Column({ default: false })
    emailVerified: boolean

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.GUEST
    })
    role: UserRole

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

    @OneToOne(() => User_Identity, (user_identity) => user_identity.user)
    identity: Relation<User_Identity>
}
