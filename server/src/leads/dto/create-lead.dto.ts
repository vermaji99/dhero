
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsIn(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'INSTAGRAM', 'GOOGLE', 'ADVERTISEMENT', 'OTHER'])
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;
}
