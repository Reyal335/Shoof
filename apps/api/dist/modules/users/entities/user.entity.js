var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User_Identity } from './user-identity.js';
import { Profile } from './profile.entity.js';
export var UserRole;
(function (UserRole) {
    UserRole["GUEST"] = "Guest";
    UserRole["MEMBER"] = "Member";
    UserRole["INFLUENCER"] = "Influencer";
    UserRole["MODERATOR"] = "Moderator";
    UserRole["ADMIN"] = "Admin";
})(UserRole || (UserRole = {}));
let User = class User {
    id;
    email;
    username;
    passwordHash;
    isActive;
    emailVerified;
    role;
    createdAt;
    updatedAt;
    identities;
    profile;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({
        type: "varchar",
        length: 150,
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({
        type: "varchar",
        length: 150,
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.MEMBER
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    OneToMany(() => User_Identity, (identity) => identity.user),
    __metadata("design:type", Object)
], User.prototype, "identities", void 0);
__decorate([
    OneToOne(() => Profile, (profile) => profile.user),
    __metadata("design:type", Object)
], User.prototype, "profile", void 0);
User = __decorate([
    Entity()
], User);
export { User };
//# sourceMappingURL=user.entity.js.map