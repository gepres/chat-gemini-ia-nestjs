import { Injectable } from '@nestjs/common';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import { Content, GoogleGenAI } from '@google/genai';
import { basicPromptUseCase } from './use-cases/basic-prompt.use-case';
import { basicPromptStreamUseCase } from './use-cases/basic-prompt-stream.use-case';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { chatPromptStreamUseCase } from './use-cases/chat-prompt-stream.use-case';

@Injectable()
export class GeminiService {
    
    private readonly ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
    });

    // TODO: mantener el memoria el historial
    private chatHistory = new Map<string, Content[]>();


    async basicPrompt(basicPromptDto: BasicPromptDto) {
        return basicPromptUseCase(this.ai, basicPromptDto);
    }


    async basicPromptStream(basicPromptDto: BasicPromptDto) {

        return basicPromptStreamUseCase(this.ai, basicPromptDto);

    }

    async chatPromptStream(chatPromptDto: ChatPromptDto) {
        const chatHistory = this.getChatHistory(chatPromptDto.chatId);
        return chatPromptStreamUseCase(this.ai, chatPromptDto, { history: chatHistory });
    }

    saveMessage(chatId: string, message: Content) {
        const messages = this.getChatHistory(chatId);
        messages.push(message);
        this.chatHistory.set(chatId, messages);
        console.log(this.chatHistory);
        
    }

    getChatHistory(chatId: string) {
        return structuredClone(this.chatHistory.get(chatId) ?? []);
    }
}
