import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
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
        status: string;
        installmentId: string;
        type: string;
        scheduledFor: Date;
        sentAt: Date | null;
        errorLog: string | null;
    })[]>;
    getInstallments(status?: string): Promise<({
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
    })[]>;
}
