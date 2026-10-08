import {
    Entity,
    Column,
    CreateDateColumn,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm'
import type { Relation } from 'typeorm'
import { User } from './user.entity.js'

export enum UserTheme {
    DARK = 'dark',
    LIGHT = 'light'
}

@Entity()
export class User_Preference {
    @PrimaryGeneratedColumn("uuid")
    preference_id: string

    @Column({
        type: "enum",
        enum: UserTheme,
        default: UserTheme.LIGHT
    })
    role: UserTheme
}