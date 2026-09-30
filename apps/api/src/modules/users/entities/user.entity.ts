import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

enum UserRole {
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
    
    @Column()
    username: string

    @Column()
    firstName: string

    @Column()
    lastName: string

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
}
