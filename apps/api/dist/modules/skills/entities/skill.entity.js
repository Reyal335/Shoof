var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
export const SKILL_KINDS = ['language', 'framework', 'platform', 'discipline'];
let Skill = class Skill {
    id;
    slug;
    name;
    kind;
    aliases;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Skill.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 64, unique: true }),
    __metadata("design:type", String)
], Skill.prototype, "slug", void 0);
__decorate([
    Column({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Skill.prototype, "kind", void 0);
__decorate([
    Column('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], Skill.prototype, "aliases", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Skill.prototype, "createdAt", void 0);
Skill = __decorate([
    Entity('skills'),
    Check(`"kind" IN ('language', 'framework', 'platform', 'discipline')`)
], Skill);
export { Skill };
//# sourceMappingURL=skill.entity.js.map