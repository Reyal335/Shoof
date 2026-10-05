import { Entity, Column, CreateDateColumn, Index, PrimaryGeneratedColumn } from 'typeorm'

// Owned by the auth module. Holds the user's id only, no relation into the users tables.
@Entity('refresh_tokens')
export class RefreshToken {
    // The token's `jti`
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column('uuid')
    userId: string

    @Index()
    @Column('uuid')
    familyId: string

    @Column({ type: 'timestamptz' })
    expiresAt: Date

    @Column({ type: 'timestamptz' })
    familyExpiresAt: Date

    // Set when the token is rotated or its family is signed out
    @Column({ type: 'timestamptz', nullable: true })
    revokedAt: Date | null

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
