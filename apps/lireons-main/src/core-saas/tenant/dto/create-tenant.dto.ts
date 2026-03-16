import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { CreateTenantBody } from '@lireons/shared-types';

export class CreateTenantDto implements CreateTenantBody {

  @IsString()
  @IsNotEmpty()
  orgName!: string;

  @IsString()
  @IsOptional()
  orgType?: string;

  @IsString()
  @IsNotEmpty()
  subdomain!: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dbRoutingKey?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  taxId?: string;
}