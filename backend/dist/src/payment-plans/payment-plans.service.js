"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let PaymentPlansService = class PaymentPlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        if (data.deposit >= data.totalAmount) {
            throw new common_1.BadRequestException('Deposit cannot be >= total amount');
        }
        const department = await this.prisma.department.findUnique({ where: { id: data.departmentId } });
        if (!department)
            throw new common_1.NotFoundException('Department not found');
        if (department.status === 'SOLD')
            throw new common_1.BadRequestException('Department already sold');
        const remaining = data.totalAmount - data.deposit;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const step = data.frequency === 'QUARTERLY' ? 3 : 1;
        const numInstallments = Math.floor(monthsDiff / step);
        if (numInstallments <= 0)
            throw new common_1.BadRequestException('Invalid date range for selected frequency');
        const installmentAmount = parseFloat((remaining / numInstallments).toFixed(2));
        const installments = Array.from({ length: numInstallments }, (_, i) => ({
            amount: installmentAmount,
            dueDate: (0, date_fns_1.addMonths)(start, (i + 1) * step),
            status: 'PENDING',
        }));
        const plan = await this.prisma.$transaction(async (tx) => {
            const created = await tx.paymentPlan.create({
                data: {
                    clientId: data.clientId,
                    departmentId: data.departmentId,
                    totalAmount: data.totalAmount,
                    deposit: data.deposit,
                    startDate: start,
                    endDate: end,
                    frequency: data.frequency,
                    installments: { create: installments },
                },
                include: { installments: true, client: true, department: true },
            });
            await tx.department.update({ where: { id: data.departmentId }, data: { status: 'RESERVED' } });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'CREATE',
                    entityType: 'PaymentPlan',
                    entityId: created.id,
                    details: JSON.stringify({ installmentCount: numInstallments, ...data }),
                },
            });
            return created;
        });
        return plan;
    }
    async findAll() {
        return this.prisma.paymentPlan.findMany({
            include: {
                client: true,
                department: true,
                installments: { orderBy: { dueDate: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.paymentPlan.findUnique({
            where: { id },
            include: { client: true, department: true, installments: { orderBy: { dueDate: 'asc' } } },
        });
    }
};
exports.PaymentPlansService = PaymentPlansService;
exports.PaymentPlansService = PaymentPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentPlansService);
//# sourceMappingURL=payment-plans.service.js.map