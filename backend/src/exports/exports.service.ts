import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async streamAccountingExport(res: Response, filters: any, userId: string) {
    await this.prisma.auditLog.create({
      data: { userId, action: 'EXPORT', entityType: 'Accounting', details: JSON.stringify(filters) },
    });

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res, useStyles: true });
    const ws = workbook.addWorksheet('Accounting');

    ws.columns = [
      { header: 'Client Name', key: 'client', width: 25 },
      { header: 'Unit Code', key: 'unit', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Amount ($)', key: 'amount', width: 18 },
    ];

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a3c5e' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    const records = await this.prisma.installment.findMany({
      where: filters.status ? { status: filters.status } : {},
      include: { paymentPlan: { include: { client: true, department: true } } },
      orderBy: { dueDate: 'asc' },
    });

    for (const r of records) {
      const row = ws.addRow({
        client: r.paymentPlan.client.name,
        unit: r.paymentPlan.department.code,
        dueDate: r.dueDate.toISOString().split('T')[0],
        status: r.status,
        amount: r.amount,
      });
      row.getCell('amount').numFmt = '"$"#,##0.00';
      if (r.status === 'OVERDUE') row.getCell('status').font = { color: { argb: 'FFCC0000' }, bold: true };
      if (r.status === 'PAID') row.getCell('status').font = { color: { argb: 'FF008000' }, bold: true };
    }

    // Summary row
    ws.addRow([]);
    const totalRow = ws.addRow({ client: 'TOTAL', amount: records.reduce((s, r) => s + r.amount, 0) });
    totalRow.font = { bold: true };
    totalRow.getCell('amount').numFmt = '"$"#,##0.00';

    await workbook.commit();
  }

  async getAccountingSummary() {
    const installments = await this.prisma.installment.findMany({
      include: { paymentPlan: { include: { client: true, department: true } } },
    });

    const total = installments.reduce((s, i) => s + i.amount, 0);
    const paid = installments.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
    const overdue = installments.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0);
    const pending = installments.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);

    return { total, paid, overdue, pending, count: installments.length };
  }
}
