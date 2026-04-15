import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import { BasicPromptDto } from "../dtos/basic-prompt.dto";
import { geminiUploadFiles } from "../helpers/gemini-upload-file";

interface Options {
    model?: string;
    systemInstruction?: string;
}

export const basicPromptStreamUseCase = async (ai: GoogleGenAI, basicPromptDto: BasicPromptDto, options?: Options) => {

    const { prompt,files = [] } = basicPromptDto;

    // const firstImage = files?.[0]!;

    // const image = await ai.files.upload({
    //     file: new Blob([firstImage.buffer as any], { type: firstImage.mimetype }),
        
    // })

    const images = await geminiUploadFiles(ai, files);
    

    const {
        model = 'gemini-2.5-flash',
        systemInstruction = `
        'responde unicamente en español, en formato markdown. usa negritas de esta forma __`,
    } = options ?? {};



    const response = await ai.models.generateContentStream({
        model,
        // contents: basicPromptDto.prompt,
        contents:[
            createUserContent([
                prompt,
                // imagenes o archivo
                // createPartFromUri(images.uri ?? '', image.mimeType ?? '')
                ...images.map(image => createPartFromUri(image.uri ?? '', image.mimeType ?? ''))
            ])
        ],
        config: {
            systemInstruction
        }
    });

    return response
}