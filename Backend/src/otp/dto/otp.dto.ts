import { IsEmail, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;
}

export class VerifyOtpDto {
  @IsIn(['email', 'phone'])
  channel!: 'email' | 'phone';

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;

  @IsString()
  @Length(4, 8)
  code!: string;
}
