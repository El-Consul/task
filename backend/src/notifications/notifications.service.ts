import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduleReminders() {
    this.logger.log('Running daily installment reminder check...');

    const target = addDays(new Date(), 2);
    const start = startOfDay(target);
    const end = endOfDay(target);

    const due = await this.prisma.installment.findMany({
      where: {
        status: 'PENDING',
        dueDate: { gte: start, lte: end },
      },
      include: {
        paymentPlan: {
          include: { client: true },
        },
      },
    });

    this.logger.log(`Found ${due.length} installments due in 2 days`);

    const webhookUrl = this.config.get<string>('MAKE_WEBHOOK_URL');

    if (!webhookUrl) {
      this.logger.error(
        'MAKE_WEBHOOK_URL is not defined in environment variables',
      );
      return;
    }

    for (const installment of due) {
      const client = installment.paymentPlan.client;

      try {
        await firstValueFrom(
          this.httpService.post(webhookUrl, {
            clientName: client.name,
            clientEmail: client.email,
            clientPhone: client.phone,
            unitCode: client.unitCode,
            amount: installment.amount,
            dueDate: installment.dueDate.toISOString().split('T')[0],
            installmentId: installment.id,
          }),
        );

        await this.prisma.notification.create({
          data: {
            installmentId: installment.id,
            type: 'EMAIL',
            status: 'SENT',
            scheduledFor: new Date(),
            sentAt: new Date(),
          },
        });

        this.logger.log(`✅ Notification sent via Webhook: ${client.name}`);
      } catch (error: any) {
        await this.prisma.notification.create({
          data: {
            installmentId: installment.id,
            type: 'EMAIL',
            status: 'FAILED',
            scheduledFor: new Date(),
            errorLog: error.message || 'Unknown error',
          },
        });

        this.logger.error(
          `❌ Failed: ${client.name} - ${error.message || 'Unknown error'}`,
        );
      }
    }
  }

  async findAll() {
    return this.prisma.notification.findMany({
      include: {
        installment: {
          include: {
            paymentPlan: { include: { client: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstallments(status?: string) {
    return this.prisma.installment.findMany({
      where: status ? { status } : {},
      include: {
        paymentPlan: { include: { client: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
