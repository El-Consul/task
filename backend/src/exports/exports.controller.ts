import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportsController {
  constructor(private readonly service: ExportsService) {}

  @Get('accounting')
  @Roles('ADMIN', 'ACCOUNTANT')
  async export(@Req() req: any, @Res() res: Response, @Query() filters: any) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=accounting_${Date.now()}.xlsx`);
    await this.service.streamAccountingExport(res, filters, req.user.id);
  }

  @Get('summary')
  @Roles('ADMIN', 'ACCOUNTANT')
  getSummary() {
    return this.service.getAccountingSummary();
  }
}
