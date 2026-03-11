import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ChatInputDto } from './dto/chatInput.dto';
import type { Response } from 'express';
import { env } from 'process';
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions/completions';
import type {
  MessageContentPartDto,
  MessageImageDetail,
} from './dto/message.dto';

@Injectable()
export class OpenAIService {
  private client: OpenAI;
  private readonly allowedImageDetail = new Set<MessageImageDetail>([
    'auto',
    'low',
    'high',
  ]);

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getResponseMessage(chatInput: ChatInputDto): Promise<string> {
    const messages = this.normalizeMessages(chatInput.input);
    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: chatInput.temperature ?? 0.7,
      messages,
    });

    return response.choices[0]?.message?.content ?? '';
  }

  async getStreamingResponse(chatInput: ChatInputDto, res: Response) {
    const messages = this.normalizeMessages(chatInput.input);
    const stream = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: chatInput.temperature ?? 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content ?? '';
      if (!delta) continue;
      res.write(`event: chunk\ndata: ${JSON.stringify({ delta })}\n\n`);
    }
  }

  private normalizeMessages(input: ChatInputDto['input']): ChatCompletionMessageParam[] {
    return input.map((message, messageIndex) => {
      if (typeof message.content === 'string') {
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionMessageParam;
      }

      if (!Array.isArray(message.content)) {
        throw new BadRequestException(
          `input[${messageIndex}].content must be a string or an array`,
        );
      }

      return {
        role: message.role,
        content: message.content.map((part, partIndex) =>
          this.normalizeContentPart(part, messageIndex, partIndex),
        ),
      } as ChatCompletionMessageParam;
    });
  }

  private normalizeContentPart(
    part: MessageContentPartDto,
    messageIndex: number,
    partIndex: number,
  ): ChatCompletionContentPart {
    if (part.type === 'text' || part.type === 'input_text') {
      if (!('text' in part) || typeof part.text !== 'string' || !part.text) {
        throw new BadRequestException(
          `input[${messageIndex}].content[${partIndex}].text must be a non-empty string`,
        );
      }

      return {
        type: 'text' as const,
        text: part.text,
      } as ChatCompletionContentPart;
    }

    if (part.type === 'image_url' || part.type === 'input_image') {
      if (!('image_url' in part)) {
        throw new BadRequestException(
          `input[${messageIndex}].content[${partIndex}].image_url is required`,
        );
      }

      return {
        type: 'image_url' as const,
        image_url: this.normalizeImageUrl(part.image_url, messageIndex, partIndex),
      } as ChatCompletionContentPart;
    }

    throw new BadRequestException(
      `input[${messageIndex}].content[${partIndex}].type is not supported`,
    );
  }

  private normalizeImageUrl(
    imageUrl: unknown,
    messageIndex: number,
    partIndex: number,
  ) {
    if (typeof imageUrl === 'string') {
      if (!imageUrl) {
        throw new BadRequestException(
          `input[${messageIndex}].content[${partIndex}].image_url must be non-empty`,
        );
      }

      return { url: imageUrl };
    }

    if (!imageUrl || typeof imageUrl !== 'object' || !('url' in imageUrl)) {
      throw new BadRequestException(
        `input[${messageIndex}].content[${partIndex}].image_url must be a string or object with url`,
      );
    }

    const { url, detail } = imageUrl as { url: unknown; detail?: unknown };
    if (typeof url !== 'string' || !url) {
      throw new BadRequestException(
        `input[${messageIndex}].content[${partIndex}].image_url.url must be a non-empty string`,
      );
    }

    if (
      detail !== undefined &&
      (typeof detail !== 'string' ||
        !this.allowedImageDetail.has(detail as MessageImageDetail))
    ) {
      throw new BadRequestException(
        `input[${messageIndex}].content[${partIndex}].image_url.detail must be auto, low or high`,
      );
    }

    return detail ? { url, detail } : { url };
  }
}
