import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

// Services and Controllers
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';

import { UsersModule } from './modules/users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';

import { FileTemplateEngine, LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail'
import { join } from 'node:path'

import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Entities
import { User } from './modules/users/entities/user.entity.js';


export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;

const ormModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Anyasam101',
  database: 'shoof',
  entities: [User],
  synchronize: true
})

const observeImports = [...(observeAppKey && observeAppSecret
  ? [
      ObserveModule.forRoot({
        appKey: observeAppKey,
        appSecret: observeAppSecret,
        serviceId: 'artist-hub',
      }),
    ]
  : []),
  MailModule.forRootAsync({
    useFactory: () => ({
      transport: process.env.SMRP_URL 
        ? new SmtpTransport({ url: process.env.SMTP_URL })
        : new LogMailTransport(),
      templates: new FileTemplateEngine({
        dir: join(import.meta.dirname, 'mail/templates'),
      }),
      from: 'Accounts <accounts@example.com>'})
  }),
  AuthenticationModule.forRootAsync({
    useFactory: () => ({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d'
      },
      emailVerification: { url: `${process.env.APP_URL}/verify-email` },
      accessToken: {
        key: process.env.JWT_ACCESS_SECRET!,
        issuer: 'shoof-api',
        audience: 'shoof-client',
        ttl: '15m'
      },
      refreshToken: {
        ttl: '30d',
        absoluteTtl: '90d'
      }
    })
  }),
  UsersModule,
  PostsModule,
  ormModule
];



@Module({
  imports: [...observeImports],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private datasource: DataSource
  ) {}
}
