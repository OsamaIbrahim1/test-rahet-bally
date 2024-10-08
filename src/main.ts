import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'
import * as env from './config'
import { HttpExceptionFilter } from './Guards';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))

  await app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

bootstrap();