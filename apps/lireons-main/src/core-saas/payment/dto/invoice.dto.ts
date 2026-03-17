import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  subId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'OPEN', 'PAST_DUE', 'PAID'])
  status?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'OPEN', 'PAST_DUE', 'PAID'])
  status?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;
}

export class InvoiceListQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'OPEN', 'PAST_DUE', 'PAID'])
  status?: string;

  @IsOptional()
  @IsUUID()
  subId?: string;
}
