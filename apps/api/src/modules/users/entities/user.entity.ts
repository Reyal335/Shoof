import { 
    Entity, 
    Column, 
    CreateDateColumn, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn, 
    OneToMany,
    OneToOne
} from 'typeorm'
import type { Relation } from 'typeorm'
import { User_Identity } from './user-identity.js'
import { Profile } from './profile.entity.js'

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

    // Null for accounts that only sign in with a provider such as Google
    @Column({ type: 'varchar', nullable: true })
    passwordHash: string | null

    @Column({ default: true })
    isActive: boolean

    @Column({ default: false })
    emailVerified: boolean

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.MEMBER
    })
    role: UserRole

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

    @OneToMany(() => User_Identity, (identity) => identity.user)
    identities: Relation<User_Identity[]>

    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Relation<Profile>
}
