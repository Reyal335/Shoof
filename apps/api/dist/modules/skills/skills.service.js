var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable } from '@nestjs/common';
import { Skill } from './entities/skill.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
export function toSkillSummary({ id, slug, name, kind }) {
    return { id, slug, name, kind };
}
let SkillsService = class SkillsService {
    skillRepository;
    constructor(skillRepository) {
        this.skillRepository = skillRepository;
    }
    async findBySlug(slug) {
        return this.skillRepository
            .createQueryBuilder('s')
            .where('s.slug = :slug OR :slug = ANY(s.aliases)', { slug: slug.toLowerCase() })
            .getOne();
    }
    async findBySlugs(slugs) {
        if (!slugs.length)
            return [];
        const lower = slugs.map((s) => s.toLowerCase());
        return this.skillRepository
            .createQueryBuilder('s')
            .where('s.slug IN (:...lower) OR s.aliases && :lower', { lower })
            .getMany();
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        return await this.skillRepository.find({
            where: {
                id: In(ids)
            },
            order: { name: 'ASC' }
        });
    }
    findAll() {
        return this.skillRepository.find({ order: { name: 'ASC' } });
    }
};
SkillsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Skill)),
    __metadata("design:paramtypes", [Repository])
], SkillsService);
export { SkillsService };
//# sourceMappingURL=skills.service.js.map