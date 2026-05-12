import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Permissions('PAYMENTS_VIEW')
  findAll() {
    return this.service.findAll();
  }

  @Get('installments')
  @Permissions('PAYMENT_PLANS_VIEW')
  getInstallments(@Query('status') status?: string) {
    return this.service.getInstallments(status);
  }
}
