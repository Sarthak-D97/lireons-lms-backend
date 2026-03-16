import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInt,
	IsObject,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';

export class UpdateOrganizationSettingsDto {
	@IsString()
	@IsOptional()
	serviceName?: string;

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

export class UpdateOrganizationDesignDto {
	@IsString()
	@IsOptional()
	landingPageLayout?: string;

	@IsString()
	@IsOptional()
	designTheme?: string;

	@IsObject()
	@IsOptional()
	customCss?: Record<string, unknown>;
}

export class UpdateOrganizationAppSettingsDto {
	@IsString()
	@IsOptional()
	appName?: string;

	@IsString()
	@IsOptional()
	packageName?: string;

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

export class UpdateTenantConfigurationDto {
	@ValidateNested()
	@Type(() => UpdateOrganizationSettingsDto)
	@IsOptional()
	settings?: UpdateOrganizationSettingsDto;

	@ValidateNested()
	@Type(() => UpdateOrganizationDesignDto)
	@IsOptional()
	design?: UpdateOrganizationDesignDto;

	@ValidateNested()
	@Type(() => UpdateOrganizationAppSettingsDto)
	@IsOptional()
	appSettings?: UpdateOrganizationAppSettingsDto;
}
