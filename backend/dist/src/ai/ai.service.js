"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let AiService = AiService_1 = class AiService {
    configService;
    openai;
    logger = new common_1.Logger(AiService_1.name);
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('AI_API_KEY') || 'ollama';
        const baseURL = this.configService.get('AI_API_URL') || 'http://localhost:11434/v1';
        this.openai = new openai_1.default({
            apiKey,
            baseURL,
        });
    }
    async getChatResponse(prompt, userId) {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.configService.get('AI_MODEL') || 'qwen2.5-coder:1.5b',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant for a Real Estate Management System. Help the user with client data, payments, and system questions.' },
                    { role: 'user', content: prompt },
                ],
            });
            return {
                message: response.choices[0].message.content,
                success: true,
            };
        }
        catch (error) {
            this.logger.error(`AI Error: ${error.message}`);
            return {
                message: 'Sorry, I am having trouble connecting to my brain right now.',
                success: false,
                error: error.message,
            };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map