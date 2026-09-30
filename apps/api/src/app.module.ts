import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;
const observeImports = [...(observeAppKey && observeAppSecret
  ? [
      ObserveModule.forRoot({
        appKey: observeAppKey,
        appSecret: observeAppSecret,
        serviceId: 'artist-hub',
      }),
    ]
  : []),
  UsersModule,
  PostsModule,
];

const ormModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Anyasam101',
  database: 'shoof',
  entities: [],
  synchronize: true
})

@Module({
  imports: [...observeImports, ormModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private datasource: DataSource
  ) {}
}
