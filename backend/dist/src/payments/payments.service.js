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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async post(userId, data) {
        return this.prisma.$transaction(async (tx) => {
            const installment = await tx.installment.findUnique({ where: { id: data.installmentId } });
            if (!installment)
                throw new common_1.NotFoundException('Installment not found');
            if (installment.status === 'PAID')
                throw new common_1.BadRequestException('Already paid');
            if (Math.abs(installment.amount - data.amount) > 0.01) {
                throw new common_1.BadRequestException(`Amount must be ${installment.amount}`);
            }
            const payment = await tx.payment.create({
                data: {
                    installmentId: data.installmentId,
                    amount: data.amount,
                    receiptUrl: data.receiptUrl,
                    reference: data.reference,
                },
            });
            await tx.installment.update({ where: { id: data.installmentId }, data: { status: 'PAID' } });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'CREATE',
                    entityType: 'Payment',
                    entityId: payment.id,
                    details: JSON.stringify(data),
                },
            });
            return payment;
        });
    }
    async findAll() {
        return this.prisma.payment.findMany({
            include: { installment: { include: { paymentPlan: { include: { client: true, department: true } } } } },
            orderBy: { paymentDate: 'desc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map