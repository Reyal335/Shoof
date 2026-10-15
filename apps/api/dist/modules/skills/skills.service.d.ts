import { Skill } from './entities/skill.entity.js';
import { Repository } from 'typeorm';
export type SkillSummary = Pick<Skill, 'id' | 'slug' | 'name' | 'kind'>;
export declare function toSkillSummary({ id, slug, name, kind }: Skill): SkillSummary;
export declare class SkillsService {
    private readonly skillRepository;
    constructor(skillRepository: Repository<Skill>);
    findBySlug(slug: string): Promise<Skill | null>;
    findBySlugs(slugs: string[]): Promise<Skill[]>;
    findByIds(ids: string[]): Promise<Skill[]>;
    findAll(): Promise<Skill[]>;
}
