import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @Roles('ADMIN', 'ACCOUNTANT')
  post(@Req() req: any, @Body() body: any) {
    return this.service.post(req.user.id, body);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT')
  findAll() {
    return this.service.findAll();
  }
}
