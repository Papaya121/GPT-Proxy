import { IsIn } from 'class-validator';

export type MessageContentTextType = 'text' | 'input_text';
export type MessageContentImageType = 'image_url' | 'input_image';
export type MessageImageDetail = 'auto' | 'low' | 'high';

export interface MessageTextContentPartDto {
  type: MessageContentTextType;
  text: string;
}

export interface MessageImageContentPartDto {
  type: MessageContentImageType;
  image_url: string | { url: string; detail?: MessageImageDetail };
}

export type MessageContentPartDto =
  | MessageTextContentPartDto
  | MessageImageContentPartDto;

export class MessageDto {
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  content!: string | MessageContentPartDto[];
}
