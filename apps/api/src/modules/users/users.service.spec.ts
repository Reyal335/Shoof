import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mergeTechStack, normalizeStackNames, toAccountView, UsersService } from './users.service.js';
import { User, UserRole } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile } from './entities/profile.entity.js';

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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeStackNames', () => {
    it('collapses whitespace, drops blanks and case-insensitive duplicates, keeping the first spelling', () => {
      expect(normalizeStackNames(['  Next.js ', 'next.js', 'Node   JS', '   ', 'Vite'])).toEqual(['Next.js', 'Node JS', 'Vite']);
    });
  });

  describe('mergeTechStack', () => {
    const current = { frontend: ['React'], backend: ['Node.js'], tools: ['Git'] };

    it('replaces only the groups that were sent', () => {
      expect(mergeTechStack(current, { backend: ['Go', 'go'] })).toEqual({ frontend: ['React'], backend: ['Go'], tools: ['Git'] });
    });

    it('lets a group be emptied', () => {
      expect(mergeTechStack(current, { tools: [] })).toEqual({ frontend: ['React'], backend: ['Node.js'], tools: [] });
    });

    it('fills in groups missing from an older row', () => {
      expect(mergeTechStack({ frontend: ['Vue'] }, {})).toEqual({ frontend: ['Vue'], backend: [], tools: [] });
      expect(mergeTechStack(null, {})).toEqual({ frontend: [], backend: [], tools: [] });
    });
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
