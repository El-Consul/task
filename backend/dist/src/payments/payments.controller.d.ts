import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    post(req: any, body: any): Promise<{
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
