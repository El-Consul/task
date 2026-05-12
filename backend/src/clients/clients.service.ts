import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(agentId: string, data: any) {
    const client = await this.prisma.client.create({ data: { ...data, agentId } });
    await this.prisma.auditLog.create({
      data: { userId: agentId, action: 'CREATE', entityType: 'Client', entityId: client.id.toString(), details: JSON.stringify(data) },
    });
    return client;
  }

  async findAll(query: { page?: number; limit?: number; search?: string; groupId?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { unitCode: { contains: query.search } },
      ];
    }
    if (query.groupId) {
      where.groupId = Number(query.groupId);
    }

    const [total, data] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        include: { agent: { select: { id: true, name: true, email: true } }, paymentPlans: true },
        orderBy: { createdAt: 'desc' },
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

  async findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { agent: true, paymentPlans: { include: { installments: { orderBy: { dueDate: 'asc' } } } } },
    });
  }

  async update(userId: string, id: number, data: any) {
    const updated = await this.prisma.client.update({ where: { id }, data });
    await this.prisma.auditLog.create({
      data: { userId, action: 'UPDATE', entityType: 'Client', entityId: id.toString(), details: JSON.stringify(data) },
    });
    return updated;
  }
}
