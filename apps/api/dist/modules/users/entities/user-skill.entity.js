var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity.js';
let UserSkill = class UserSkill {
    userId;
    skillId;
    user;
};
__decorate([
    PrimaryColumn('uuid'),
    __metadata("design:type", String)
], UserSkill.prototype, "userId", void 0);
__decorate([
    PrimaryColumn('uuid'),
    __metadata("design:type", String)
], UserSkill.prototype, "skillId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", Object)
], UserSkill.prototype, "user", void 0);
UserSkill = __decorate([
    Entity('user_skills'),
    Index(['skillId', 'userId'])
], UserSkill);
export { UserSkill };
//# sourceMappingURL=user-skill.entity.js.map