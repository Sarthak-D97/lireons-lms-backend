import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  invoiceId!: string;

  @IsString()
  gateway!: string;

  @IsOptional()
  @IsString()
  gatewayPaymentId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountPaid!: number;

  @IsString()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status!: string;

  @IsOptional()
  @IsDateString()
  processedAt?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  gateway?: string;

  @IsOptional()
  @IsString()
  gatewayPaymentId?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  processedAt?: string;
}

export class TransactionListQueryDto {
  @IsOptional()
  @IsString()
  gateway?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsUUID()
  invoiceId?: string;
}
