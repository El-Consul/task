import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private openai;
    private readonly logger;
    constructor(configService: ConfigService);
    getChatResponse(prompt: string, userId: string): Promise<{
        message: string | null;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        success: boolean;
        error: any;
    }>;
}
