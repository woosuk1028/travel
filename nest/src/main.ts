import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = config.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((s) => s.trim()) : true,
    credentials: true,
  });

  const uploadsRoot = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsRoot)) {
    fs.mkdirSync(uploadsRoot, { recursive: true });
  }
  app.useStaticAssets(uploadsRoot, { prefix: '/uploads' });

  const port = parseInt(config.get<string>('PORT') ?? '4000', 10);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api`);
}
bootstrap();
