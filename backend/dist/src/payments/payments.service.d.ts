import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    post(userId: string, data: {
        installmentId: string;
        amount: number;
        receiptUrl?: string;
        reference?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        amount: number;
        paymentDate: Date;
        receiptUrl: string | null;
        reference: string | null;
        installmentId: string;
    }>;
    findAll(): Promise<({
        installment: {
            paymentPlan: {
                department: {
                    id: string;
                    name: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    price: number;
                    status: string;
                };
                client: {
                    id: string;
                    email: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phone: string;
                    idNumber: string | null;
                    agentId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                totalAmount: number;
                deposit: number;
                startDate: Date;
                endDate: Date;
                frequency: string;
                clientId: string;
                departmentId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dueDate: Date;
            status: string;
            amount: number;
            paymentPlanId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        amount: number;
        paymentDate: Date;
        receiptUrl: string | null;
        reference: string | null;
        installmentId: string;
    })[]>;
}
