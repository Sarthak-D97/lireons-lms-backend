import { IsIn, IsOptional, IsString } from 'class-validator';

export class InvoiceListQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'OPEN', 'PAST_DUE', 'PAID'])
  status?: string;
}
