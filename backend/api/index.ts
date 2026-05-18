import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

@Controller()
class AppController {
  @Get('*')
  hello() {
    return { ok: true };
  }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
})
class AppModule {}

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api');
    await app.init();
  }
}

export default async (req: any, res: any) => {
  try {
    await bootstrap();
    server(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
};
