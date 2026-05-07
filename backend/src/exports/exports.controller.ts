import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('exports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportsController {
  constructor(private readonly service: ExportsService) {}

  @Get('accounting')
  @Permissions('PAYMENTS_VIEW')
  async export(@Req() req: any, @Res() res: Response, @Query() filters: any) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=accounting_${Date.now()}.xlsx`);
    await this.service.streamAccountingExport(res, filters, req.user.id);
  }

  @Get('summary')
  @Permissions('PAYMENTS_VIEW')
  getSummary() {
    return this.service.getAccountingSummary();
  }
}
