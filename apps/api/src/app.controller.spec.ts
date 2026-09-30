import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppModule } from './app.module.js';
import { AppService } from './app.service.js';
import { PostsController } from './posts/posts.controller.js';
import { UsersController } from './modules/users/users.controller.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

describe('AppModule', () => {
  it('should register both feature modules', async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(app.get(UsersController)).toBeDefined();
    expect(app.get(PostsController)).toBeDefined();
  });
});
