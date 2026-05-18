import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @Permissions('PAYMENTS_MANAGE')
  post(@Req() req: any, @Body() body: CreatePaymentDto) {
    return this.service.post(req.user.id, body);
  }

  @Get()
  @Permissions('PAYMENTS_VIEW')
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query.page, query.limit);
  }
}
