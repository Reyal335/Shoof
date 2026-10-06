import { Check, Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'

// Owned by the follows module. Holds user ids only, no relation into the users tables.
@Entity('follows')
@Check(`"followerId" <> "followingId"`)
export class Follow {
    @PrimaryColumn('uuid')
    followerId: string

    @Index()
    @PrimaryColumn('uuid')
    followingId: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
