import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import express from 'express';

const server = express();

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }
}

export default async (req: any, res: any) => {
  try {
    await bootstrap();
    server(req, res);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(500).json({ error: 'Internal Server Error', message: String(error) });
  }
};

if (process.env.NODE_ENV !== 'production') {
  const startLocal = async () => {
    const localApp = await NestFactory.create(AppModule);
    localApp.enableCors();
    localApp.setGlobalPrefix('api');
    localApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await localApp.listen(3001);
    console.log('Backend running on http://localhost:3001');
  };
  startLocal();
}
