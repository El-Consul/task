import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    const clientId = data.clientId ? parseInt(data.clientId.toString()) : null;
    const unitPrice = data.unitPrice || data.totalAmount;
    const deposit = data.deposit || 0;
    const contractDate = data.contractDate || data.startDate;

    if (!clientId) throw new BadRequestException('Client ID is required');
    if (!unitPrice) throw new BadRequestException('Unit Price is required');
    if (!contractDate)
      throw new BadRequestException('Contract Date is required');

    if (deposit >= unitPrice) {
      throw new BadRequestException('Deposit cannot be >= unit price');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const remainingAmount = unitPrice - deposit;
    const start = new Date(contractDate);

    let installments = data.installments;

    // Automatic generation if no installments provided
    if (!installments || !installments.length) {
      if (!data.endDate)
        throw new BadRequestException(
          'End Date is required for auto-generation',
        );

      const end = new Date(data.endDate);
      const freq = data.frequency || 'MONTHLY';
      installments = [];

      const current = new Date(start);
      // Skip the first month if it's the contract month?
      // Traditional logic: first installment is 1 month after contract

      while (current < end) {
        if (freq === 'MONTHLY') current.setMonth(current.getMonth() + 1);
        else if (freq === 'QUARTERLY') current.setMonth(current.getMonth() + 3);
        else break;

        if (current > end) break;
        installments.push({
          amount: 0, // Will distribute below
          dueDate: new Date(current),
        });
      }

      if (installments.length > 0) {
        const perInstallment = remainingAmount / installments.length;
        installments.forEach((i: any) => (i.amount = perInstallment));
      }
    }

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await (tx.paymentPlan as any).create({
        data: {
          clientId,
          unitPrice,
          contractDate: start,
          deposit,
          remainingAmount,
          assessmentAmount: data.assessmentAmount,
          measurements: data.measurements,
          deposit10Percent: data.deposit10Percent,
          installments: {
            create: installments.map((inst: any) => ({
              amount: inst.amount,
              dueDate: new Date(inst.dueDate),
              type: inst.type || 'REGULAR',
              status: 'PENDING',
            })),
          },
        },
        include: { installments: true, client: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'PaymentPlan',
          entityId: created.id,
          details: JSON.stringify({
            unitPrice: data.unitPrice,
            remainingAmount,
          }),
        },
      });

      return created;
    });

    return plan;
  }

  async findAll() {
    return this.prisma.paymentPlan.findMany({
      include: {
        client: true,
        installments: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.paymentPlan.findUnique({
      where: { id },
      include: { client: true, installments: { orderBy: { dueDate: 'asc' } } },
    });
  }

  async addInstallment(
    userId: string,
    planId: string,
    data: { amount: number; dueDate: string; type: string },
  ) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Payment plan not found');

    const installment = await (this.prisma.installment as any).create({
      data: {
        paymentPlanId: planId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        type: data.type,
        status: 'PENDING',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'PaymentPlan',
        entityId: planId,
        details: JSON.stringify({
          action: 'ADD_INSTALLMENT',
          amount: data.amount,
          type: data.type,
        }),
      },
    });

    return installment;
  }
}
