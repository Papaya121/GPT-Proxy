import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { OpenAIModule } from './open-ai/open-ai.module';

@Module({
  imports: [OpenAIModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
