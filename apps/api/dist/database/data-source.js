import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity.js';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Post } from '../modules/posts/entities/post.entity.js';
import { Media } from '../modules/posts/entities/media.entity.js';
import { Comment } from '../modules/posts/entities/comment.entity.js';
import { Rating } from '../modules/posts/entities/rating.entity.js';
config({ path: resolve(import.meta.dirname, '../../../../.env'), quiet: true });
const options = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, RefreshToken, Post, Media, Comment, Rating],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    seeds: ['src/database/seeds/**/*.ts'],
    factories: ['src/database/factories/**/*.ts'],
};
export const AppDataSource = new DataSource(options);
//# sourceMappingURL=data-source.js.map