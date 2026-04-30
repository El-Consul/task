import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(agentId: string, data: { name: string; email: string; phone: string; idNumber?: string }) {
    const client = await this.prisma.client.create({ data: { ...data, agentId } });
    await this.prisma.auditLog.create({
      data: { userId: agentId, action: 'CREATE', entityType: 'Client', entityId: client.id, details: JSON.stringify(data) },
    });
    return client;
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: { agent: { select: { id: true, name: true, email: true } }, paymentPlans: { include: { department: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { agent: true, paymentPlans: { include: { department: true, installments: { orderBy: { dueDate: 'asc' } } } } },
    });
  }

  async update(userId: string, id: string, data: any) {
    const updated = await this.prisma.client.update({ where: { id }, data });
    await this.prisma.auditLog.create({
      data: { userId, action: 'UPDATE', entityType: 'Client', entityId: id, details: JSON.stringify(data) },
    });
    return updated;
  }
}
