import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service.js';
import { SkillsController } from './skills.controller.js';
import { Skill } from './entities/skill.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Skill])],
  controllers: [SkillsController],
  providers: [SkillsService],
  // Posts and users resolve typed names to skills through this
  exports: [SkillsService],
})
export class SkillsModule {}
