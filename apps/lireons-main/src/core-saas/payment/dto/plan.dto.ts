import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateSaasPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  maxStudentsAllowed!: number;

  @IsInt()
  @Min(1)
  maxStorageGb!: number;

  @IsOptional()
  @IsBoolean()
  hasWhiteLabelApp?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSaasPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudentsAllowed?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorageGb?: number;

  @IsOptional()
  @IsBoolean()
  hasWhiteLabelApp?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PlanListQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  includeInactive?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class PlanByIdParamDto {
  @IsUUID()
  id!: string;
}
