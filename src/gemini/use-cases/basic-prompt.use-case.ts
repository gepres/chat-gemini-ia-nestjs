import { GoogleGenAI } from "@google/genai";
import { BasicPromptDto } from "../dtos/basic-prompt.dto";

export const basicPromptUseCase = async (ai: GoogleGenAI, basicPromptDto: BasicPromptDto) => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: basicPromptDto.prompt,
        config: {
            systemInstruction: 'responde unicamente en español, en formato markdown. usa negritas de esta forma __'
        }
    });

    return {
        message: response.text
    }
}