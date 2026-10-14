import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity.js';
import { FollowService } from './follows.service.js';
import { FollowsController } from './follows.controller.js';
import { UsersModule } from '../users/users.module.js';

// The routes sit under /users/:id/follow (FollowsController is @Controller('users')) but belong to this module.
@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule],
  controllers: [FollowsController],
  providers: [FollowService],
  exports: [FollowService]
})
export class FollowsModule {}
