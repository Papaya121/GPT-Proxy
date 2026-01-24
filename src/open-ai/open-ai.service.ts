import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ChatInputDto } from './dto/chatInput.dto';
import type { Response } from 'express';
import { env } from 'process';

@Injectable()
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getResponseMessage(chatInput: ChatInputDto): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: chatInput.input,
    });

    return response.choices[0]?.message?.content ?? '';
  }

  async getStreamingResponse(chatInput: ChatInputDto, res: Response) {
    const stream = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: chatInput.input,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content ?? '';
      if (!delta) continue;
      res.write(`event: chunk\ndata: ${JSON.stringify({ delta })}\n\n`);
    }
  }
}
