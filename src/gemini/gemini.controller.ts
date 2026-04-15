import { Body, Controller, Get, HttpStatus, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { GenerateContentResponse } from '@google/genai';
import { ImageGenerationDto } from './dtos/image-generation.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}


  async outputStreamResponse(stream: AsyncGenerator<GenerateContentResponse, any, any>, res: Response) {
  
    res.setHeader('Content-Type', 'text/plain');
    res.status(HttpStatus.OK)
    

    let resultText = ''

    for await (const chunk of stream) {
      const piece = chunk.text;
      resultText += piece;
      res.write(piece);
    }

    res.end();

    return resultText;
  }


  @Post('/basic-prompt')
   basicPrompt(@Body() body: BasicPromptDto ) {
    return this.geminiService.basicPrompt(body);
  }

  @Post('/basic-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {

    // console.log({files});

    basicPromptDto.files = files ?? []
    
    const stream = await this.geminiService.basicPromptStream(basicPromptDto);

    void await this.outputStreamResponse(stream, res);

    
  }

    @Post('/chat-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async chatPromptStream(
    @Body() chatPromptDto: ChatPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {

    // console.log({files});

    chatPromptDto.files = files ?? []
    
    const stream = await this.geminiService.chatPromptStream(chatPromptDto);

    const data = await this.outputStreamResponse(stream, res);

    const geminiMessage = {
        role: 'model',
        parts: [{ text: data }],
    }

    const userMessage = {
      role: 'user',
      parts: [{ text: chatPromptDto.prompt }],
    }

    this.geminiService.saveMessage(chatPromptDto.chatId, userMessage);
    this.geminiService.saveMessage(chatPromptDto.chatId, geminiMessage);

    console.log({data});
  }


  @Get('/chat-history/:chatId')
  getChatHistory(@Param('chatId') chatId: string) {
    return this.geminiService.getChatHistory(chatId).map(message => {
      return {
        role: message.role,
        parts: message.parts?.map(part => part.text).join(''),
      }
    })
  } 


  @Post('image-generation')
  @UseInterceptors(FilesInterceptor('files'))
  async imageGeneration(
    @Body() imageGenerationDto: ImageGenerationDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {

    imageGenerationDto.files = files ?? []
    
    const result = await this.geminiService.imageGeneration(imageGenerationDto);
    
    return {
      imageUrl: result.imageUrl,
      text: result.text
    }
  }
}
