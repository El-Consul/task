import { PrismaService } from '../prisma/prisma.service';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(agentId: string, data: {
        name: string;
        email: string;
        phone: string;
        idNumber?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        idNumber: string | null;
        agentId: string;
    }>;
    findAll(): Promise<({
        agent: {
            id: string;
            email: string;
            name: string;
        };
        paymentPlans: ({
            department: {
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                price: number;
                status: string;
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
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        idNumber: string | null;
        agentId: string;
    })[]>;
    findOne(id: string): Promise<({
        agent: {
            id: string;
            email: string;
            password: string;
            name: string;
            role: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        paymentPlans: ({
            department: {
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                price: number;
                status: string;
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
        })[];
    } & {
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        idNumber: string | null;
        agentId: string;
    }) | null>;
    update(userId: string, id: string, data: any): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        idNumber: string | null;
        agentId: string;
    }>;
}
