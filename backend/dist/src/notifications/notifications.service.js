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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scheduleReminders() {
        this.logger.log('Running daily installment reminder check...');
        const target = (0, date_fns_1.addDays)(new Date(), 2);
        const start = (0, date_fns_1.startOfDay)(target);
        const end = (0, date_fns_1.endOfDay)(target);
        const due = await this.prisma.installment.findMany({
            where: { status: 'PENDING', dueDate: { gte: start, lte: end } },
            include: { paymentPlan: { include: { client: true, department: true } } },
        });
        this.logger.log(`Found ${due.length} installments due in 2 days`);
        for (const installment of due) {
            const client = installment.paymentPlan.client;
            const dept = installment.paymentPlan.department;
            await this.prisma.notification.create({
                data: {
                    installmentId: installment.id,
                    type: 'EMAIL',
                    status: 'SENT',
                    scheduledFor: new Date(),
                    sentAt: new Date(),
                },
            });
            this.logger.log(`[REMINDER] Client: ${client.name} | Unit: ${dept.code} | Amount: ${installment.amount} | Due: ${installment.dueDate.toDateString()}`);
        }
    }
    async findAll() {
        return this.prisma.notification.findMany({
            include: { installment: { include: { paymentPlan: { include: { client: true, department: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getInstallments(status) {
        return this.prisma.installment.findMany({
            where: status ? { status } : {},
            include: { paymentPlan: { include: { client: true, department: true } } },
            orderBy: { dueDate: 'asc' },
        });
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "scheduleReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map