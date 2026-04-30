import type { Response } from 'express';
import { ExportsService } from './exports.service';
export declare class ExportsController {
    private readonly service;
    constructor(service: ExportsService);
    export(req: any, res: Response, filters: any): Promise<void>;
    getSummary(): Promise<{
        total: number;
        paid: number;
        overdue: number;
        pending: number;
        count: number;
    }>;
}
