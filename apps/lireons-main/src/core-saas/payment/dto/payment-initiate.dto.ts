import { IsUUID } from 'class-validator';

export class PaymentInitiateDto {
  @IsUUID()
  invoiceId!: string;
}
