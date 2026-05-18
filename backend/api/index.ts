// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const express = require('express');

const server = express();

server.use(require('cors')({ origin: true, credentials: true }));

let handler;

async function bootstrap() {
  const { AppModule } = require('../dist/src/app.module');
  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new (require('@nestjs/common').ValidationPipe)({ whitelist: true, transform: true })
  );
  await app.init();

  handler = server;
}

module.exports = async (req: any, res: any) => {
  try {
    if (!handler) await bootstrap();
    handler(req, res);
  } catch (err) {
    console.error('Handler error:', err?.message, err?.stack);
    res.status(500).json({ error: err?.message || String(err), stack: err?.stack?.split('\n').slice(0, 5).join('\n') });
  }
};
