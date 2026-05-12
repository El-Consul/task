import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('AI_API_KEY') || 'ollama';
    const baseURL = this.configService.get<string>('AI_API_URL') || 'http://localhost:11434/v1';

    this.openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async getChatResponse(prompt: string, userId: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('AI_MODEL') || 'qwen2.5-coder:1.5b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for a Real Estate Management System. Help the user with client data, payments, and system questions.' },
          { role: 'user', content: prompt },
        ],
      });

      return {
        message: response.choices[0].message.content,
        success: true,
      };
    } catch (error) {
      this.logger.error(`AI Error: ${error.message}`);
      return {
        message: 'Sorry, I am having trouble connecting to my brain right now.',
        success: false,
        error: error.message,
      };
    }
  }
}
