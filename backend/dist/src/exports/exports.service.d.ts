import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
export declare class ExportsService {
    private prisma;
    constructor(prisma: PrismaService);
    streamAccountingExport(res: Response, filters: any, userId: string): Promise<void>;
    getAccountingSummary(): Promise<{
        total: number;
        paid: number;
        overdue: number;
        pending: number;
        count: number;
    }>;
}
