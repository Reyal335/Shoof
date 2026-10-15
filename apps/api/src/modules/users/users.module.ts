import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Profile } from './entities/profile.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { UserSkill } from './entities/user-skill.entity.js';
import { SkillsModule } from '../skills/skills.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, User_Identity, Profile, UserSkill]), SkillsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
