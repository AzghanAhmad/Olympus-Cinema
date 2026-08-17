import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ScreenStatus, SeatStatus, SeatType } from '@prisma/client';

export class CreateScreenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ enum: ScreenStatus })
  @IsOptional()
  @IsEnum(ScreenStatus)
  status?: ScreenStatus;
}

export class UpdateScreenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ enum: ScreenStatus })
  @IsOptional()
  @IsEnum(ScreenStatus)
  status?: ScreenStatus;
}

export class CreateSeatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  row!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  number!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ enum: SeatType })
  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @ApiPropertyOptional({ enum: SeatStatus })
  @IsOptional()
  @IsEnum(SeatStatus)
  status?: SeatStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  positionX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  positionY?: number;
}

export class UpdateSeatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  row?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ enum: SeatType })
  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @ApiPropertyOptional({ enum: SeatStatus })
  @IsOptional()
  @IsEnum(SeatStatus)
  status?: SeatStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  positionX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  positionY?: number;
}

export class BulkCreateSeatsDto {
  @ApiProperty({ type: [CreateSeatDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSeatDto)
  seats!: CreateSeatDto[];
}

export class QueryScreensDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
