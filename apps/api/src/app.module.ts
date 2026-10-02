import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

// Services and Controllers
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';

import { UsersModule } from './modules/users/users.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FileTemplateEngine, LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail'
import { join } from 'node:path'

import { DataSource } from 'typeorm';

// Entities
import { User } from './modules/users/entities/user.entity.js';


export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;

const ormModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
      type: 'postgres',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_DATABASE'),
      autoLoadEntities: true,
      synchronize: true
  })
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
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '../../.env'
  }),
  MailModule.forRootAsync({
    useFactory: () => ({
      transport: process.env.SMTP_URL 
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
  imports: [...observeImports, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private datasource: DataSource
  ) {}
}
