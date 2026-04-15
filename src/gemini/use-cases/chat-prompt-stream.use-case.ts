import { Content, createPartFromUri, GoogleGenAI } from "@google/genai";
import { ChatPromptDto } from "../dtos/chat-prompt.dto";
import { geminiUploadFiles } from "../helpers/gemini-upload-file";

interface Options {
    model?: string;
    systemInstruction?: string;
    history?: Content[];
}

export const chatPromptStreamUseCase = async (ai: GoogleGenAI, chatPromptDto: ChatPromptDto, options?: Options) => {

    const { prompt,files = [] } = chatPromptDto;

    // refactorizar
    const uploadedFiles = await geminiUploadFiles(ai, files);
    

    const {
        model = 'gemini-2.5-flash',
        systemInstruction = `
        'responde unicamente en español, en formato markdown. usa negritas de esta forma __`,
        history = []
    } = options ?? {};



   const chat = ai.chats.create({
    model,
    config: {
        systemInstruction
    },
    history,
  });


  const response = await chat.sendMessageStream({
    message: [
        prompt,
        ...uploadedFiles.map(file => createPartFromUri(file.uri ?? '', file.mimeType ?? ''))
    ],
  });

  return response

}