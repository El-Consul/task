import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    clientId: number;
    unitPrice: number;
    contractDate: string;
    deposit: number;
    measurements?: number;
    deposit10Percent?: number;
    installments: {
      amount: number;
      dueDate: string;
      type?: string;
    }[];
  }) {
    if (data.deposit >= data.unitPrice) {
      throw new BadRequestException('Deposit cannot be >= unit price');
    }

    const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const remainingAmount = data.unitPrice - data.deposit;
    const start = new Date(data.contractDate);

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.paymentPlan.create({
        data: {
          clientId: data.clientId,
          unitPrice: data.unitPrice,
          contractDate: start,
          deposit: data.deposit,
          remainingAmount,
          measurements: data.measurements,
          deposit10Percent: data.deposit10Percent,
          installments: {
            create: data.installments.map(inst => ({
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
          details: JSON.stringify({ unitPrice: data.unitPrice, remainingAmount }),
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
}
