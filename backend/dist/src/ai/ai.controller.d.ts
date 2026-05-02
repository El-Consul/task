import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(prompt: string, req: any): Promise<{
        message: string | null;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        success: boolean;
        error: any;
    }>;
}
