import { PrismaService } from '../prisma/prisma.service';
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        code: string;
        name?: string;
        price: number;
    }): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        price: number;
        status: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        price: number;
        status: string;
    }[]>;
    findByCode(code: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        price: number;
        status: string;
    } | null>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        price: number;
        status: string;
    }>;
}
