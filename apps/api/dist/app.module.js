var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileTemplateEngine, LogMailTransport, MailModule, SmtpTransport } from '@nestjs/mail';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { PostsModule } from './modules/posts/posts.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();
const observeAppKey = process.env.OBSERVE_APP_KEY;
const observeAppSecret = process.env.OBSERVE_APP_SECRET;
const ormModule = TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true
    })
});
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
            from: 'Accounts <accounts@example.com>'
        })
    }),
    AuthenticationModule.forRootAsync({
        globalGuard: false,
        useFactory: () => ({
            emailVerification: { url: `${process.env.APP_URL}/verify-email` },
        })
    }),
    UsersModule,
    ormModule
];
let AppModule = class AppModule {
    datasource;
    constructor(datasource) {
        this.datasource = datasource;
    }
};
AppModule = __decorate([
    Module({
        imports: [...observeImports, AuthModule, PostsModule],
        controllers: [AppController],
        providers: [AppService],
    }),
    __metadata("design:paramtypes", [DataSource])
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map