import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users.map((u) => ({
      ...u,
      permissions: JSON.parse(u.permissions || '[]'),
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, permissions: JSON.parse(user.permissions || '[]') };
  }

  async update(id: string, data: any) {
    // Strip empty password to avoid overwriting with a hash of ""
    if (!data.password) {
      delete data.password;
    } else {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Handle permissions if present
    if (data.permissions) {
      data.permissions = JSON.stringify(data.permissions);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });
    return { ...updated, permissions: JSON.parse(updated.permissions || '[]') };
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
