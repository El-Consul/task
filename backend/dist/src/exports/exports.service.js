"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let ExportsService = class ExportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async streamAccountingExport(res, filters, userId) {
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
            if (r.status === 'OVERDUE')
                row.getCell('status').font = { color: { argb: 'FFCC0000' }, bold: true };
            if (r.status === 'PAID')
                row.getCell('status').font = { color: { argb: 'FF008000' }, bold: true };
        }
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
};
exports.ExportsService = ExportsService;
exports.ExportsService = ExportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportsService);
//# sourceMappingURL=exports.service.js.map