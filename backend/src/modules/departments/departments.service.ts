import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

interface CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
}

interface UpdateDepartmentDto {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Department with code ${data.code} already exists`);
    }

    return this.prisma.department.create({
      data,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        _count: {
          select: { users: true, clients: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async findByCode(code: string) {
    const department = await this.prisma.department.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    });

    if (!department || !department.isActive) {
      throw new NotFoundException(`Department with code ${code} not found or inactive`);
    }

    return department;
  }

  async update(id: string, data: UpdateDepartmentDto) {
    await this.findById(id);

    if (data.code) {
      const existing = await this.prisma.department.findUnique({
        where: { code: data.code },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Department with code ${data.code} already exists`);
      }
    }

    return this.prisma.department.update({
      where: { id },
      data,
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
