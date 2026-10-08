import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { PostCategory } from './entities/post.entity.js';
import type { AuthUser } from '../auth/auth.types.js';
import type { CreatePostDto } from './dto/create-post.dto.js';

describe('PostsController', () => {
  let controller: PostsController;
  const service = { create: vi.fn(), rate: vi.fn() };
  const user: AuthUser = { id: 'user-1', roles: [] };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: service }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates the post as the signed-in user', () => {
    const dto = { category: PostCategory.GAMES, link: 'https://a.example.com', caption: 'c', description: 'd' } as CreatePostDto;
    void controller.create(user, dto);
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('rates with the value from the body', () => {
    void controller.rate('post-1', user, { value: 4 });
    expect(service.rate).toHaveBeenCalledWith('post-1', user, 4);
  });
});
