
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

let cachedServer: ReturnType<typeof serverlessExpress>;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // NOTE: On Vercel we serve everything from under /api via the catch-all at
  //       api/[...all].js. The incoming path is already prefixed with /api
  //       (e.g. /api/auth/login). If we also called setGlobalPrefix('api'),
  //       Nest would prepend its own /api again -> lookups would hit
  //       /api/api/auth/login and 404. So the Vercel handler intentionally
  //       skips the global prefix. Local dev (main.ts) still uses
  //       setGlobalPrefix('api') for the http://localhost:3000/api/... URL
  //       shape expected in docs / earlier configurations.

  await app.init();

  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export const handler = async (event: any, context: any, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
