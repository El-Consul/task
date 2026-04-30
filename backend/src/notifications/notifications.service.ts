import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduleReminders() {
    this.logger.log('Running daily installment reminder check...');
    const target = addDays(new Date(), 2);
    const start = startOfDay(target);
    const end = endOfDay(target);

    const due = await this.prisma.installment.findMany({
      where: { status: 'PENDING', dueDate: { gte: start, lte: end } },
      include: { paymentPlan: { include: { client: true, department: true } } },
    });

    this.logger.log(`Found ${due.length} installments due in 2 days`);

    for (const installment of due) {
      const client = installment.paymentPlan.client;
      const dept = installment.paymentPlan.department;

      await this.prisma.notification.create({
        data: {
          installmentId: installment.id,
          type: 'EMAIL',
          status: 'SENT',
          scheduledFor: new Date(),
          sentAt: new Date(),
        },
      });

      // In production: send real email here via SendGrid/Twilio
      this.logger.log(
        `[REMINDER] Client: ${client.name} | Unit: ${dept.code} | Amount: ${installment.amount} | Due: ${installment.dueDate.toDateString()}`
      );
    }
  }

  async findAll() {
    return this.prisma.notification.findMany({
      include: { installment: { include: { paymentPlan: { include: { client: true, department: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstallments(status?: string) {
    return this.prisma.installment.findMany({
      where: status ? { status } : {},
      include: { paymentPlan: { include: { client: true, department: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }
}
