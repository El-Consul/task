import { DepartmentsService } from './departments.service';
export declare class DepartmentsController {
    private readonly service;
    constructor(service: DepartmentsService);
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        price: number;
        status: string;
    }>;
}
