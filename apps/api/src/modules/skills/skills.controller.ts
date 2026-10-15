import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // The whole catalog. Small and rarely changes, so the web app fetches it once and filters it in the browser.
  @Public()
  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

}
