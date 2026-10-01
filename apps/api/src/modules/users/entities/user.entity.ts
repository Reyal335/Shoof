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

    @Column({ type: 'date' })
    date_only: string

    @Column({ type: 'timestamptz' })
    date_time_with_timezone: Date;
}
