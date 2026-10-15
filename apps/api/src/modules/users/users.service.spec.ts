import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { toAccountView, UsersService } from './users.service.js';
import { User, UserRole } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile } from './entities/profile.entity.js';
import { UserSkill } from './entities/user-skill.entity.js';
import { SkillsService } from '../skills/skills.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // forFeature() only runs inside UsersModule, so the repositories are stubbed here
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(User_Identity), useValue: {} },
        { provide: getRepositoryToken(Profile), useValue: {} },
        { provide: getRepositoryToken(UserSkill), useValue: {} },
        { provide: SkillsService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toAccountView', () => {
    it('sends only the listed fields, whatever else the row carries', () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const row = {
        id: 'u1', email: 'a@example.com', username: 'a_user', emailVerified: true, role: UserRole.MEMBER, createdAt,
        passwordHash: 'secret', isActive: true, updatedAt: createdAt, someFutureColumn: 'internal',
      } as unknown as User;
      expect(toAccountView(row)).toStrictEqual({
        id: 'u1', email: 'a@example.com', username: 'a_user', emailVerified: true, role: UserRole.MEMBER, createdAt,
      });
    });
  });
});
