import { Controller, Get, Query, Res, UseGuards, Req, Param } from '@nestjs/common';
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

  @Get('yearly')
  @Permissions('PAYMENTS_VIEW')
  async exportYearly(@Req() req: any, @Res() res: Response, @Query('year') year: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=yearly_${y}.xlsx`);
    await this.service.streamYearlyReport(res, y, req.user.id);
  }

  @Get('client/:id')
  @Permissions('CLIENTS_VIEW')
  async exportClient(@Req() req: any, @Res() res: Response, @Param('id') id: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=client_${id}.xlsx`);
    await this.service.streamClientReport(res, parseInt(id), req.user.id);
  }

  @Get('units')
  @Permissions('PAYMENTS_VIEW')
  async exportUnits(@Req() req: any, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=units_status.xlsx`);
    await this.service.streamUnitsReport(res, req.user.id);
  }

  @Get('summary')
  @Permissions('PAYMENTS_VIEW')
  getSummary() {
    return this.service.getAccountingSummary();
  }
}
