import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './modules/auth/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @Public()
  @HttpCode(200)
  getHello(): string {
    return this.appService.getHello();
  }
}
