import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { OpenAIService } from './open-ai/open-ai.service';
import { ChatInputDto } from './open-ai/dto/chatInput.dto';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly openAIService: OpenAIService) {}

  @Post()
  async getAIResponse(@Body() input: ChatInputDto, @Res() res: Response) {
    if (input.stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();
      res.write(`event: ready\ndata: {}\n\n`);

      try {
        await this.openAIService.getStreamingResponse(input, res);
      } catch (e: any) {
        res.write(
          `event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`,
        );
      } finally {
        res.write(`event: done\ndata: {}\n\n`);
        res.end();
      }
      return;
    }

    const message = await this.openAIService.getResponseMessage(input);
    res.json({ message });
  }
}
