import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

// Services and Controllers
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';

import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FileTemplateEngine, LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail'
import { join } from 'node:path'

import { DataSource } from 'typeorm';

// Entities
import { User } from './modules/users/entities/user.entity.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { FollowsModule } from './modules/follows/follows.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
      // The schema comes from src/database/migrations only (npm run migration:run). Never sync from the entities:
      // a renamed column would be dropped along with its data.
      synchronize: false
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
      from: process.env.MAIL_FROM ?? 'Accounts <accounts@example.com>'})
  }),
  // Password hashing and email verification only. Authentication is passport's (AuthModule),
  // so this module's own guard stays off.
  AuthenticationModule.forRootAsync({
    globalGuard: false,
    useFactory: () => ({
      emailVerification: { url: `${process.env.APP_URL}/verify-email` },
    })
  }),
  UsersModule,
  ormModule,
  EventEmitterModule.forRoot({
    // set this to `true` to use wildcards
    wildcard: false,
    // the delimiter used to segment namespaces
    delimiter: '.',
    // set this to `true` if you want to emit the newListener event
    newListener: false,
    // set this to `true` if you want to emit the removeListener event
    removeListener: false,
    // the maximum amount of listeners that can be assigned to an event
    maxListeners: 10,
    // show event name in memory leak message when more than maximum amount of listeners is assigned
    verboseMemoryLeak: false,
    // disable throwing uncaughtException if an error event is emitted and it has no listeners
    ignoreErrors: false,
  })
];



@Module({
  imports: [
    ...observeImports, 
    AuthModule, 
    PostsModule, 
    FollowsModule, 
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private datasource: DataSource
  ) {}
}
