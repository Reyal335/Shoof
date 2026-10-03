import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: "*",
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
