import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  resetToken?: string;

  @IsOptional()
  resetTokenExpiration?: Date;
}