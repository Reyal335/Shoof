import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity.js';

// Entities only for now; the service and controller land with the follow endpoints.
@Module({
  imports: [TypeOrmModule.forFeature([Follow])],
})
export class FollowsModule {}
