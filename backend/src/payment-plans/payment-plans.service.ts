import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addMonths } from 'date-fns';

@Injectable()
export class PaymentPlansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    clientId: string;
    departmentId: string;
    totalAmount: number;
    deposit: number;
    startDate: string;
    endDate: string;
    frequency: string;
  }) {
    if (data.deposit >= data.totalAmount) {
      throw new BadRequestException('Deposit cannot be >= total amount');
    }

    const department = await this.prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) throw new NotFoundException('Department not found');
    if (department.status === 'SOLD') throw new BadRequestException('Department already sold');

    const remaining = data.totalAmount - data.deposit;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Calculate installment count
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const step = data.frequency === 'QUARTERLY' ? 3 : 1;
    const numInstallments = Math.floor(monthsDiff / step);

    if (numInstallments <= 0) throw new BadRequestException('Invalid date range for selected frequency');

    const installmentAmount = parseFloat((remaining / numInstallments).toFixed(2));

    const installments = Array.from({ length: numInstallments }, (_, i) => ({
      amount: installmentAmount,
      dueDate: addMonths(start, (i + 1) * step),
      status: 'PENDING',
    }));

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.paymentPlan.create({
        data: {
          clientId: data.clientId,
          departmentId: data.departmentId,
          totalAmount: data.totalAmount,
          deposit: data.deposit,
          startDate: start,
          endDate: end,
          frequency: data.frequency,
          installments: { create: installments },
        },
        include: { installments: true, client: true, department: true },
      });

      await tx.department.update({ where: { id: data.departmentId }, data: { status: 'RESERVED' } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'PaymentPlan',
          entityId: created.id,
          details: JSON.stringify({ installmentCount: numInstallments, ...data }),
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
        department: true,
        installments: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.paymentPlan.findUnique({
      where: { id },
      include: { client: true, department: true, installments: { orderBy: { dueDate: 'asc' } } },
    });
  }
}
