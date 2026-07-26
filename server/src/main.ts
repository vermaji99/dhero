
try { require('dotenv').config(); } catch { /* local .env only */ }
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

function parseCorsOrigins(envValue: string | undefined): (string | RegExp)[] | true | undefined {
  if (!envValue) return undefined;
  if (envValue === '*') return true;
  return envValue
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (pattern.includes('*')) {
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`);
      }
      return pattern.replace(/\/$/, '');
    });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins === true) return callback(null, true);
      if (!allowedOrigins) return callback(null, true);
      const match = allowedOrigins.some((o) =>
        typeof o === 'string'
          ? requestOrigin.replace(/\/$/, '') === o
          : o.test(requestOrigin),
      );
      callback(null, match ? requestOrigin : false);
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
