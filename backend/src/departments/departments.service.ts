import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { code: string; name?: string; price: number }) {
    return this.prisma.department.create({ data });
  }

  async findAll() {
    return this.prisma.department.findMany({ orderBy: { code: 'asc' } });
  }

  async findByCode(code: string) {
    return this.prisma.department.findUnique({ where: { code } });
  }

  async update(id: string, data: any) {
    return this.prisma.department.update({ where: { id }, data });
  }
}
