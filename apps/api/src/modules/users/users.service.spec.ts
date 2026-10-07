import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // forFeature() only runs inside UsersModule, so the repositories are stubbed here
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(User_Identity), useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
