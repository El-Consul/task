import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payment-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentPlansController {
  constructor(private readonly service: PaymentPlansService) {}

  @Post()
  @Roles('ADMIN', 'SALES_AGENT')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
