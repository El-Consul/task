import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async streamAccountingExport(res: Response, filters: any, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'EXPORT',
        entityType: 'Accounting',
        details: JSON.stringify(filters),
      },
    });

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
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
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1a3c5e' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    const records = await this.prisma.installment.findMany({
      where: filters.status ? { status: filters.status } : {},
      include: { paymentPlan: { include: { client: true } } },
      orderBy: { dueDate: 'asc' },
    });

    for (const r of records) {
      const row = ws.addRow({
        client: (r as any).paymentPlan.client.name,
        unit: (r as any).paymentPlan.client.unitCode || '—',
        dueDate: r.dueDate.toISOString().split('T')[0],
        status: r.status,
        amount: r.amount,
      });
      row.getCell('amount').numFmt = '"$"#,##0.00';
      if (r.status === 'OVERDUE')
        row.getCell('status').font = {
          color: { argb: 'FFCC0000' },
          bold: true,
        };
      if (r.status === 'PAID')
        row.getCell('status').font = {
          color: { argb: 'FF008000' },
          bold: true,
        };
    }

    // Summary row
    ws.addRow([]);
    const totalRow = ws.addRow({
      client: 'TOTAL',
      amount: records.reduce((s, r) => s + r.amount, 0),
    });
    totalRow.font = { bold: true };
    totalRow.getCell('amount').numFmt = '"$"#,##0.00';

    await workbook.commit();
  }

  async streamYearlyReport(res: Response, year: number, _userId: string) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'EXPORT',
        entityType: 'YearlyReport',
        details: JSON.stringify({ year }),
      },
    });

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const ws = workbook.addWorksheet(`Yearly Report ${year}`);

    ws.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Expected Amount ($)', key: 'expected', width: 20 },
      { header: 'Collected Amount ($)', key: 'collected', width: 20 },
      { header: 'Outstanding ($)', key: 'outstanding', width: 20 },
    ];

    const installments = await this.prisma.installment.findMany({
      where: {
        dueDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
    });

    for (let month = 0; month < 12; month++) {
      const monthInstallments = installments.filter(
        (i) => i.dueDate.getMonth() === month,
      );
      const expected = monthInstallments.reduce((s, i) => s + i.amount, 0);
      const collected = monthInstallments
        .filter((i) => i.status === 'PAID')
        .reduce((s, i) => s + i.amount, 0);
      const outstanding = expected - collected;

      ws.addRow({
        month: new Date(year, month).toLocaleString('default', {
          month: 'long',
        }),
        expected,
        collected,
        outstanding,
      });
    }

    await workbook.commit();
  }

  async streamClientReport(res: Response, clientId: number, _userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { paymentPlans: { include: { installments: true } } },
    });

    if (!client) throw new Error('Client not found');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const ws = workbook.addWorksheet(`Client - ${client.name}`);

    ws.columns = [
      { header: 'Installment', key: 'type', width: 20 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Amount ($)', key: 'amount', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    client.paymentPlans.forEach((plan) => {
      plan.installments.forEach((inst) => {
        ws.addRow({
          type: inst.type,
          dueDate: inst.dueDate.toISOString().split('T')[0],
          amount: inst.amount,
          status: inst.status,
        });
      });
    });

    await workbook.commit();
  }

  async streamUnitsReport(res: Response, _userId: string) {
    const departments = await this.prisma.department.findMany();

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const ws = workbook.addWorksheet('Units Status');

    ws.columns = [
      { header: 'Code', key: 'code', width: 15 },
      { header: 'Unit Name', key: 'name', width: 25 },
      { header: 'Price ($)', key: 'price', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    for (const d of departments) {
      ws.addRow({
        code: d.code,
        name: d.name,
        price: d.price,
        status: d.status,
      });
    }

    await workbook.commit();
  }

  async getAccountingSummary() {
    const installments = await this.prisma.installment.findMany();
    const total = installments.reduce((s, i) => s + i.amount, 0);
    const paid = installments
      .filter((i) => i.status === 'PAID')
      .reduce((s, i) => s + i.amount, 0);
    const overdue = installments
      .filter((i) => i.status === 'OVERDUE')
      .reduce((s, i) => s + i.amount, 0);
    const pending = installments
      .filter((i) => i.status === 'PENDING')
      .reduce((s, i) => s + i.amount, 0);

    return { total, paid, overdue, pending, count: installments.length };
  }
}
