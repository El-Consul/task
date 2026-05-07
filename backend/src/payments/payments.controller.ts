import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @Permissions('PAYMENTS_MANAGE')
  post(@Req() req: any, @Body() body: any) {
    return this.service.post(req.user.id, body);
  }

  @Get()
  @Permissions('PAYMENTS_VIEW')
  findAll() {
    return this.service.findAll();
  }
}
