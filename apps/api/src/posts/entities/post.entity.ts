import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Post {
    @PrimaryGeneratedColumn("uuid")
    post_id: string   

    @Column({
        type: "varchar",
        length: 150
    })
    post_caption: string


}
