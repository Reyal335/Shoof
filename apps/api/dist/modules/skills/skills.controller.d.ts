import { SkillsService } from './skills.service.js';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(): Promise<import("./entities/skill.entity.js").Skill[]>;
}
