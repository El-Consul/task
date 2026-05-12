import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('payment-plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentPlansController {
  constructor(private readonly service: PaymentPlansService) {}

  @Post()
  @Permissions('PAYMENT_PLANS_MANAGE')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  @Permissions('PAYMENT_PLANS_VIEW')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('PAYMENT_PLANS_VIEW')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/installments')
  @Permissions('PAYMENT_PLANS_MANAGE')
  addInstallment(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.addInstallment(req.user.id, id, body);
  }
}
