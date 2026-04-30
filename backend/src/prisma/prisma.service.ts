import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    } as any);
  }

  async onModuleInit() {
    await this.$connect();
    const count = await this.user.count();
    console.log(`[PrismaService] Connected. Users in DB: ${count}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
