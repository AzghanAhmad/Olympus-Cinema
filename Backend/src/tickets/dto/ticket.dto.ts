import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secureToken!: string;
}
