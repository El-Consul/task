import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async post(userId: string, data: { installmentId: string; amount: number; receiptUrl?: string; reference?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const installment = await tx.installment.findUnique({ where: { id: data.installmentId } });
      if (!installment) throw new NotFoundException('Installment not found');
      if (installment.status === 'PAID') throw new BadRequestException('Already paid');
      if (Math.abs(installment.amount - data.amount) > 0.01) {
        throw new BadRequestException(`Amount must be ${installment.amount}`);
      }

      const lastPayment = await tx.payment.findFirst({
        orderBy: { receiptNumber: 'desc' },
      });
      const nextReceiptNumber = (lastPayment?.receiptNumber || 1000) + 1;

      const payment = await tx.payment.create({
        data: {
          installmentId: data.installmentId,
          amount: data.amount,
          receiptUrl: data.receiptUrl,
          reference: data.reference,
          receiptNumber: nextReceiptNumber,
        },
      });

      await tx.installment.update({ where: { id: data.installmentId }, data: { status: 'PAID' } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'Payment',
          entityId: payment.id,
          details: JSON.stringify(data),
        },
      });

      return payment;
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.findMany({
        include: { installment: { include: { paymentPlan: { include: { client: true } } } } },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private readonly logger = new Logger(PaymentsService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueInstallments() {
    this.logger.log('Starting Overdue Installments Check...');
    const today = new Date();
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.installment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    console.log(`[Cron] Marked ${result.count} installments as OVERDUE.`);
  }
}
