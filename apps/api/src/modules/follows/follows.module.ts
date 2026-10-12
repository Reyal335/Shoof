import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity.js';
import { FollowService } from './follows.service.js';
import { UsersModule } from '../users/users.module.js';

// The follow routes live on UsersController (/users/:id/follow) for now, so UsersModule imports this module.
@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule],
  providers: [FollowService],
  exports: [FollowService]
})
export class FollowsModule {}
