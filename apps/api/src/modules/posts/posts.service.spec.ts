import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { normalizeTechStack, PostsService } from './posts.service.js';
import { Post } from './entities/post.entity.js';
import { Comment } from './entities/comment.entity.js';

// The transactional behaviour is covered against a real database in test/posts.e2e-spec.ts
describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: {} },
        { provide: getRepositoryToken(Comment), useValue: {} },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeTechStack', () => {
    it('collapses whitespace, drops blanks and keeps the order', () => {
      expect(normalizeTechStack(['  Next.js ', 'Node   JS', '   ', 'Vite'])).toEqual(['Next.js', 'Node JS', 'Vite']);
    });

    it('drops case-insensitive duplicates, keeping the first spelling', () => {
      expect(normalizeTechStack(['React', 'react', 'REACT ', 'TypeScript'])).toEqual(['React', 'TypeScript']);
    });
  });
});
