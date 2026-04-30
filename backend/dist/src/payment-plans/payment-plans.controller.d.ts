import { PaymentPlansService } from './payment-plans.service';
export declare class PaymentPlansController {
    private readonly service;
    constructor(service: PaymentPlansService);
    create(req: any, body: any): Promise<{
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
        installments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dueDate: Date;
            status: string;
            amount: number;
            paymentPlanId: string;
        }[];
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
    }>;
    findAll(): Promise<({
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
        installments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dueDate: Date;
            status: string;
            amount: number;
            paymentPlanId: string;
        }[];
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
    })[]>;
    findOne(id: string): Promise<({
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
        installments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dueDate: Date;
            status: string;
            amount: number;
            paymentPlanId: string;
        }[];
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
    }) | null>;
}
