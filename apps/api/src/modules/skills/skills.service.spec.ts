import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SkillsService } from './skills.service.js';
import { Skill } from './entities/skill.entity.js';

describe('SkillsService', () => {
  let service: SkillsService;
  const repository = { find: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillsService, { provide: getRepositoryToken(Skill), useValue: repository }],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('skips the query for an empty id list', async () => {
    expect(await service.findByIds([])).toEqual([]);
    expect(repository.find).not.toHaveBeenCalled();
  });
});
