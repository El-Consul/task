import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditAction } from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('ADMIN')
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findAll({
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.findById(id);
  }
}
