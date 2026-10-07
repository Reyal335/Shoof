var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity.js';
let User_Identity = class User_Identity {
    id;
    userId;
    user;
    provider;
    providerUserId;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User_Identity.prototype, "id", void 0);
__decorate([
    Index(),
    Column('uuid'),
    __metadata("design:type", String)
], User_Identity.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.identities, {
        onDelete: "CASCADE"
    }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", Object)
], User_Identity.prototype, "user", void 0);
__decorate([
    Column({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], User_Identity.prototype, "provider", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], User_Identity.prototype, "providerUserId", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], User_Identity.prototype, "createdAt", void 0);
User_Identity = __decorate([
    Entity(),
    Index(['provider', 'providerUserId'], { unique: true })
], User_Identity);
export { User_Identity };
//# sourceMappingURL=user-identity.js.map