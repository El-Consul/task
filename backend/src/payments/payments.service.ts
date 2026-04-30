import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

      const payment = await tx.payment.create({
        data: {
          installmentId: data.installmentId,
          amount: data.amount,
          receiptUrl: data.receiptUrl,
          reference: data.reference,
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

  async findAll() {
    return this.prisma.payment.findMany({
      include: { installment: { include: { paymentPlan: { include: { client: true, department: true } } } } },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
