import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverless from 'serverless-http';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedHandler: any;

async function bootstrap() {
  if (!cachedHandler) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    nestApp.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    
    nestApp.setGlobalPrefix('api');
    await nestApp.init();
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler;
}

export const handler = async (event: any, context: any) => {
  const handler = await bootstrap();
  return handler(event, context);
};
