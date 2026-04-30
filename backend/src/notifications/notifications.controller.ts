import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT')
  findAll() {
    return this.service.findAll();
  }

  @Get('installments')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  getInstallments(@Query('status') status?: string) {
    return this.service.getInstallments(status);
  }
}
