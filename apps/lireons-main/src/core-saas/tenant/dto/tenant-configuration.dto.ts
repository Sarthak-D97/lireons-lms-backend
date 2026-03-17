import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';

export class OrganizationSettingsDto {
	@IsString()
	@IsNotEmpty()
	serviceName: string;

	@IsString()
	@IsOptional()
	logoUrl?: string;

	@IsString()
	@IsOptional()
	primaryColor?: string;

	@IsString()
	@IsOptional()
	secondaryColor?: string;

	@IsString()
	@IsOptional()
	fontFamily?: string;

	@IsString()
	@IsOptional()
	fontSize?: string;
}

export class OrganizationDesignDto {
	@IsString()
	@IsNotEmpty()
	landingPageLayout: string;

	@IsString()
	@IsNotEmpty()
	designTheme: string;

	@IsObject()
	@IsOptional()
	customCss?: Record<string, unknown>;
}

export class OrganizationAppSettingsDto {
	@IsString()
	@IsNotEmpty()
	appName: string;

	@IsString()
	@IsNotEmpty()
	packageName: string;

	@IsString()
	@IsOptional()
	appIconUrl?: string;

	@IsString()
	@IsOptional()
	appStatus?: string;

	@IsBoolean()
	@IsOptional()
	allowOfflineDownload?: boolean;

	@IsInt()
	@Min(1)
	@IsOptional()
	maxDevicesPerUser?: number;
}

export class TenantConfigurationDto {
	@ValidateNested()
	@Type(() => OrganizationSettingsDto)
	settings: OrganizationSettingsDto;

	@ValidateNested()
	@Type(() => OrganizationDesignDto)
	@IsOptional()
	design?: OrganizationDesignDto;

	@ValidateNested()
	@Type(() => OrganizationAppSettingsDto)
	appSettings: OrganizationAppSettingsDto;
}