import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.init();
  }
}

// Vercel serverless handler
export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

// Local development
if (process.env.NODE_ENV !== 'production') {
  const startLocal = async () => {
    const localApp = await NestFactory.create(AppModule);
    localApp.enableCors();
    localApp.setGlobalPrefix('api');
    await localApp.listen(3001);
    console.log('🚀 Local Backend running at http://localhost:3001/api');
  };
  startLocal();
}
