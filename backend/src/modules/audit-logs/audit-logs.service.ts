import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditAction } from '@prisma/client';

interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        oldValues: true,
        newValues: true,
        ipAddress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async logCreate(
    userId: string | undefined,
    entityType: string,
    entityId: string,
    newValue: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      userId,
      action: AuditAction.CREATE,
      entityType,
      entityId,
      newValues: newValue,
      ipAddress,
      userAgent,
    });
  }

  async logUpdate(
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      userId,
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues: oldValue,
      newValues: newValue,
      ipAddress,
      userAgent,
    });
  }

  async logDelete(
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValue: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      userId,
      action: AuditAction.DELETE,
      entityType,
      entityId,
      oldValues: oldValue,
      ipAddress,
      userAgent,
    });
  }

  async logStatusChange(
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      userId,
      action: AuditAction.STATUS_CHANGE,
      entityType,
      entityId,
      oldValues: oldValue,
      newValues: newValue,
      ipAddress,
      userAgent,
    });
  }

  async logExport(
    userId: string | undefined,
    entityType: string,
    metadata: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.create({
      userId,
      action: AuditAction.EXPORT,
      entityType,
      metadata,
      ipAddress,
      userAgent,
    });
  }
}
