import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ClientStatus } from '@prisma/client';

interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: Date;
  departmentId: string;
  assignedAgentId: string;
  notes?: string;
}

interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: Date;
  departmentId?: string;
  assignedAgentId?: string;
  status?: ClientStatus;
  notes?: string;
}

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    // Validate department exists and is active
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department || !department.isActive) {
      throw new BadRequestException('Invalid or inactive department');
    }

    // Check for existing client with same email or ID number
    const existing = await this.prisma.client.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.idNumber ? [{ idNumber: data.idNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Client with this email or ID number already exists');
    }

    return this.prisma.client.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        alternatePhone: true,
        idNumber: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        dateOfBirth: true,
        status: true,
        notes: true,
        createdAt: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        assignedAgent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: ClientStatus;
    departmentId?: string;
    assignedAgentId?: string;
    search?: string;
  }) {
    const where: any = { deletedAt: null };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters?.assignedAgentId) {
      where.assignedAgentId = filters.assignedAgentId;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.client.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        assignedAgent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { paymentPlans: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        alternatePhone: true,
        idNumber: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        dateOfBirth: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        assignedAgent: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        paymentPlans: {
          select: {
            id: true,
            name: true,
            totalAmount: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: { select: { installments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, data: UpdateClientDto) {
    await this.findById(id);

    if (data.email || data.idNumber) {
      const existing = await this.prisma.client.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.idNumber ? [{ idNumber: data.idNumber }] : []),
          ],
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Client with this email or ID number already exists');
      }
    }

    if (data.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department || !department.isActive) {
        throw new BadRequestException('Invalid or inactive department');
      }
    }

    return this.prisma.client.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        updatedAt: true,
        department: {
          select: { id: true, code: true, name: true },
        },
        assignedAgent: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(id: string, status: ClientStatus) {
    await this.findById(id);

    return this.prisma.client.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}
