import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @IsUUID()
  @IsOptional()
  planId?: string;

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