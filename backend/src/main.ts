import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, Accept',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  next();
});

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  }
}

export default async (req: any, res: any) => {
  try {
    await bootstrap();
    server(req, res);
  } catch (err: any) {
    console.error('Handler error:', err?.message, err?.stack);
    res.status(500).json({
      error: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 5).join('\n'),
    });
  }
};

if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  const startLocal = async () => {
    const localApp = await NestFactory.create(AppModule);
    localApp.enableCors();
    localApp.setGlobalPrefix('api');
    localApp.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await localApp.listen(3001);
    console.log('Local server running on http://localhost:3001');
  };
  startLocal();
}
