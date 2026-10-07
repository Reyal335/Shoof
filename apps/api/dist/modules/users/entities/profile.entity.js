var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';
let Profile = class Profile {
    userId;
    user;
    displayName;
    bio;
    avatarUrl;
    websiteUrl;
    links;
    country;
    locale;
    timezone;
    currency;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryColumn('uuid'),
    __metadata("design:type", String)
], Profile.prototype, "userId", void 0);
__decorate([
    OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", Object)
], Profile.prototype, "user", void 0);
__decorate([
    Column({ type: 'varchar', length: 80 }),
    __metadata("design:type", String)
], Profile.prototype, "displayName", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "bio", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "avatarUrl", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "websiteUrl", void 0);
__decorate([
    Column({ type: 'jsonb', default: () => `'[]'` }),
    __metadata("design:type", Array)
], Profile.prototype, "links", void 0);
__decorate([
    Column({ type: 'char', length: 2, nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "country", void 0);
__decorate([
    Column({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "locale", void 0);
__decorate([
    Column({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "timezone", void 0);
__decorate([
    Column({ type: 'char', length: 3, nullable: true }),
    __metadata("design:type", Object)
], Profile.prototype, "currency", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Profile.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Profile.prototype, "updatedAt", void 0);
Profile = __decorate([
    Entity('profiles')
], Profile);
export { Profile };
//# sourceMappingURL=profile.entity.js.map