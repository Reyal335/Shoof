import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import type { SeederOptions } from 'typeorm-extension';

import { User } from '../modules/users/entities/user.entity.js';
import { User_Identity } from '../modules/users/entities/user-identity.js';
import { Profile } from '../modules/users/entities/profile.entity.js';
import { Follow } from '../modules/follows/entities/follow.entity.js';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Post } from '../modules/posts/entities/post.entity.js';
import { Media } from '../modules/posts/entities/media.entity.js';
import { Comment } from '../modules/posts/entities/comment.entity.js';
import { Rating } from '../modules/posts/entities/rating.entity.js';

config({ path: resolve(import.meta.dirname, '../../../../.env'), quiet: true });

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, User_Identity, Profile, Follow, RefreshToken, Post, Media, Comment, Rating],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  seeds: ['src/database/seeds/**/*.ts'],
  factories: ['src/database/factories/**/*.ts'],
};

export const AppDataSource = new DataSource(options);
