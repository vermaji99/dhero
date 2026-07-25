
import { IsOptional, IsString } from 'class-validator';

export class AssignLeadDto {
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
