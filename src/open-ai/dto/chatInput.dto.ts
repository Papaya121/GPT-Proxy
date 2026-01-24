import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { MessageDto } from './message.dto';

export class ChatInputDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  input!: MessageDto[];

  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}
