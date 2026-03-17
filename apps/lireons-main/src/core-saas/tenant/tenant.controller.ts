import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Request,
	UploadedFile,
	UnauthorizedException,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { StartCustomDomainDto } from './dto/start-custom-domain.dto';
import { TenantConfigurationDto } from './dto/tenant-configuration.dto';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantService } from './tenant.service';
import type { JwtAuthUser } from '@lireons/shared-types';
import { JwtAuthGuard } from '@repo/auth';
import type { UploadImageFile } from './tenant.service';

@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
	constructor(private readonly tenantService: TenantService) {}

	private requireOwnerId(req: { user: JwtAuthUser }) {
		if (!req.user?.ownerId) {
			throw new UnauthorizedException(
				'Tenant owner context is missing. Complete signup with org type first.',
			);
		}

		return req.user.ownerId;
	}

	@Post()
	create(
		@Request() req: { user: JwtAuthUser },
		@Body() createTenantDto: CreateTenantDto,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.create(createTenantDto, ownerId);
	}

	@Post('configuration')
	createTenantConfiguration(
		@Request() req: { user: JwtAuthUser },
		@Body() tenantConfigurationDto: TenantConfigurationDto,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.tenantConfiguration(ownerId, tenantConfigurationDto);
	}

	@Patch('configuration')
	updateTenantConfiguration(
		@Request() req: { user: JwtAuthUser },
		@Body() updateTenantConfigurationDto: UpdateTenantConfigurationDto,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.updateTenantConfiguration(
			ownerId,
			updateTenantConfigurationDto,
		);
	}

	@Get('configuration')
	getTenantConfiguration(@Request() req: { user: JwtAuthUser }) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.getTenantConfiguration(ownerId);
	}

	@Post('configuration/upload-logo')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	uploadOrganizationLogo(
		@Request() req: { user: JwtAuthUser },
		@UploadedFile() file: UploadImageFile,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.uploadOrganizationLogo(ownerId, file);
	}

	@Post('configuration/upload-app-icon')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	uploadAppIcon(
		@Request() req: { user: JwtAuthUser },
		@UploadedFile() file: UploadImageFile,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.uploadAppIcon(ownerId, file);
	}

	@Get()
	findAll() {
		return this.tenantService.findAll();
	}

	@Get('plans')
	getActivePlans() {
		return this.tenantService.getActivePlans();
	}

	@Post('custom-domain/start')
	startCustomDomainVerification(
		@Request() req: { user: JwtAuthUser },
		@Body() startCustomDomainDto: StartCustomDomainDto,
	) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.startCustomDomainVerification(
			ownerId,
			startCustomDomainDto.customDomain,
		);
	}

	@Post('custom-domain/verify')
	verifyCustomDomain(@Request() req: { user: JwtAuthUser }) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.verifyCustomDomain(ownerId);
	}

	@Get('custom-domain/status')
	getCustomDomainStatus(@Request() req: { user: JwtAuthUser }) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.getCustomDomainStatus(ownerId);
	}

	@Post('deploy')
	deployTenant(@Request() req: { user: JwtAuthUser }) {
		const ownerId = this.requireOwnerId(req);
		return this.tenantService.deployTenant(ownerId);
	}

	@Get(':id')
	findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.tenantService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body() updateTenantDto: UpdateTenantDto,
	) {
		return this.tenantService.update(id, updateTenantDto);
	}

	@Delete(':id')
	remove(@Param('id', new ParseUUIDPipe()) id: string) {
		return this.tenantService.remove(id);
	}
}
