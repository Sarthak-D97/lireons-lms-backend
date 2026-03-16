import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PRISMA_SERVICE, PrismaClient } from '@lireons/database';
import type { Prisma } from '@lireons/database';
import type { CreateTenantWithOwner } from '@lireons/shared-types';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
	TenantConfigurationDto,
} from './dto/tenant-configuration.dto';
import {
	UpdateTenantConfigurationDto,
} from './dto/update-tenant-configuration.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
	constructor(
		@Inject(PRISMA_SERVICE)
		private readonly prisma: PrismaClient,
	) {}

	create(createTenantDto: CreateTenantDto, ownerId: string) {
		const { phone, billingAddress, taxId, ...tenantData } = createTenantDto;

		const tenantPayload: CreateTenantWithOwner = {
			...tenantData,
			ownerId,
		};

		return this.prisma.$transaction(async (tx) => {
			if (phone || billingAddress || taxId) {
				await tx.tenantOwner.update({
					where: { id: ownerId },
					data: {
						phone: phone || undefined,
						billingAddress: billingAddress || undefined,
						taxId: taxId || undefined,
					},
				});
			}

			return tx.tenantOrganization.create({
				data: tenantPayload,
			});
		});
	}

	findAll() {
		return this.prisma.tenantOrganization.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findOne(id: string) {
		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id },
		});

		if (!tenant) {
			throw new NotFoundException(`Tenant ${id} not found`);
		}

		return tenant;
	}

	async update(id: string, updateTenantDto: UpdateTenantDto) {
		await this.findOne(id);

		return this.prisma.tenantOrganization.update({
			where: { id },
			data: updateTenantDto,
		});
	}

	async remove(id: string) {
		await this.findOne(id);

		return this.prisma.tenantOrganization.delete({
			where: { id },
		});
	}

	private async findOwnerTenantId(ownerId: string): Promise<string> {
		const tenant = await this.prisma.tenantOrganization.findFirst({
			where: { ownerId },
			select: { id: true },
		});

		if (!tenant) {
			throw new NotFoundException(
				`No tenant found for owner ${ownerId}. Create a tenant first.`,
			);
		}

		return tenant.id;
	}

	private async getConfigRows(orgId: string) {
		const [settings, design, appSettings] = await Promise.all([
			this.prisma.organizationSettings.findUnique({ where: { orgId } }),
			this.prisma.organizationDesign.findUnique({ where: { orgId } }),
			this.prisma.organizationAppSettings.findUnique({ where: { orgId } }),
		]);

		return { settings, design, appSettings };
	}

	async tenantConfiguration(
		ownerId: string,
		tenantConfigurationDto: TenantConfigurationDto,
	) {
		const orgId = await this.findOwnerTenantId(ownerId);

		const result = await this.prisma.$transaction(async (tx) => {
			const settings = await tx.organizationSettings.upsert({
				where: { orgId },
				create: {
					orgId,
					serviceName: tenantConfigurationDto.settings.serviceName,
					logoUrl: tenantConfigurationDto.settings.logoUrl,
					primaryColor: tenantConfigurationDto.settings.primaryColor,
					secondaryColor: tenantConfigurationDto.settings.secondaryColor,
					fontFamily: tenantConfigurationDto.settings.fontFamily,
					fontSize: tenantConfigurationDto.settings.fontSize,
				},
				update: {
					serviceName: tenantConfigurationDto.settings.serviceName,
					logoUrl: tenantConfigurationDto.settings.logoUrl,
					primaryColor: tenantConfigurationDto.settings.primaryColor,
					secondaryColor: tenantConfigurationDto.settings.secondaryColor,
					fontFamily: tenantConfigurationDto.settings.fontFamily,
					fontSize: tenantConfigurationDto.settings.fontSize,
				},
			});

			const design = await tx.organizationDesign.upsert({
				where: { orgId },
				create: {
					orgId,
					landingPageLayout: tenantConfigurationDto.design.landingPageLayout,
					designTheme: tenantConfigurationDto.design.designTheme,
					customCss:
						tenantConfigurationDto.design.customCss as
							| Prisma.InputJsonValue
							| undefined,
				},
				update: {
					landingPageLayout: tenantConfigurationDto.design.landingPageLayout,
					designTheme: tenantConfigurationDto.design.designTheme,
					customCss:
						tenantConfigurationDto.design.customCss as
							| Prisma.InputJsonValue
							| undefined,
				},
			});

			const appSettings = await tx.organizationAppSettings.upsert({
				where: { orgId },
				create: {
					orgId,
					appName: tenantConfigurationDto.appSettings.appName,
					packageName: tenantConfigurationDto.appSettings.packageName,
					appIconUrl: tenantConfigurationDto.appSettings.appIconUrl,
					appStatus:
						tenantConfigurationDto.appSettings.appStatus || 'BUILDING',
					allowOfflineDownload:
						tenantConfigurationDto.appSettings.allowOfflineDownload ?? false,
					maxDevicesPerUser:
						tenantConfigurationDto.appSettings.maxDevicesPerUser ?? 2,
				},
				update: {
					appName: tenantConfigurationDto.appSettings.appName,
					packageName: tenantConfigurationDto.appSettings.packageName,
					appIconUrl: tenantConfigurationDto.appSettings.appIconUrl,
					appStatus: tenantConfigurationDto.appSettings.appStatus,
					allowOfflineDownload:
						tenantConfigurationDto.appSettings.allowOfflineDownload,
					maxDevicesPerUser:
						tenantConfigurationDto.appSettings.maxDevicesPerUser,
				},
			});

			return { settings, design, appSettings };
		});

		return {
			orgId,
			...result,
		};
	}

	async updateTenantConfiguration(
		ownerId: string,
		updateTenantConfigurationDto: UpdateTenantConfigurationDto,
	) {
		const orgId = await this.findOwnerTenantId(ownerId);
		const existing = await this.getConfigRows(orgId);

		const result = await this.prisma.$transaction(async (tx) => {
			let settings = existing.settings;
			if (updateTenantConfigurationDto.settings) {
				if (settings) {
					settings = await tx.organizationSettings.update({
						where: { orgId },
						data: updateTenantConfigurationDto.settings,
					});
				} else {
					if (!updateTenantConfigurationDto.settings.serviceName) {
						throw new BadRequestException(
							'settings.serviceName is required to create settings for the first time.',
						);
					}

					settings = await tx.organizationSettings.create({
						data: {
							orgId,
							serviceName: updateTenantConfigurationDto.settings.serviceName,
							logoUrl: updateTenantConfigurationDto.settings.logoUrl,
							primaryColor: updateTenantConfigurationDto.settings.primaryColor,
							secondaryColor: updateTenantConfigurationDto.settings.secondaryColor,
							fontFamily: updateTenantConfigurationDto.settings.fontFamily,
							fontSize: updateTenantConfigurationDto.settings.fontSize,
						},
					});
				}
			}

			let design = existing.design;
			if (updateTenantConfigurationDto.design) {
				if (design) {
					design = await tx.organizationDesign.update({
						where: { orgId },
						data: {
							landingPageLayout:
								updateTenantConfigurationDto.design.landingPageLayout,
							designTheme: updateTenantConfigurationDto.design.designTheme,
							customCss:
								updateTenantConfigurationDto.design.customCss as
									| Prisma.InputJsonValue
									| undefined,
						},
					});
				} else {
					if (
						!updateTenantConfigurationDto.design.landingPageLayout ||
						!updateTenantConfigurationDto.design.designTheme
					) {
						throw new BadRequestException(
							'design.landingPageLayout and design.designTheme are required to create design for the first time.',
						);
					}

					design = await tx.organizationDesign.create({
						data: {
							orgId,
							landingPageLayout:
								updateTenantConfigurationDto.design.landingPageLayout,
							designTheme: updateTenantConfigurationDto.design.designTheme,
							customCss:
								updateTenantConfigurationDto.design.customCss as
									| Prisma.InputJsonValue
									| undefined,
						},
					});
				}
			}

			let appSettings = existing.appSettings;
			if (updateTenantConfigurationDto.appSettings) {
				if (appSettings) {
					appSettings = await tx.organizationAppSettings.update({
						where: { orgId },
						data: updateTenantConfigurationDto.appSettings,
					});
				} else {
					if (
						!updateTenantConfigurationDto.appSettings.appName ||
						!updateTenantConfigurationDto.appSettings.packageName
					) {
						throw new BadRequestException(
							'appSettings.appName and appSettings.packageName are required to create app settings for the first time.',
						);
					}

					appSettings = await tx.organizationAppSettings.create({
						data: {
							orgId,
							appName: updateTenantConfigurationDto.appSettings.appName,
							packageName: updateTenantConfigurationDto.appSettings.packageName,
							appIconUrl: updateTenantConfigurationDto.appSettings.appIconUrl,
							appStatus:
								updateTenantConfigurationDto.appSettings.appStatus ||
								'BUILDING',
							allowOfflineDownload:
								updateTenantConfigurationDto.appSettings.allowOfflineDownload ??
								false,
							maxDevicesPerUser:
								updateTenantConfigurationDto.appSettings.maxDevicesPerUser ?? 2,
						},
					});
				}
			}

			return { settings, design, appSettings };
		});

		return {
			orgId,
			...result,
		};
	}

	async getTenantConfiguration(ownerId: string) {
		const orgId = await this.findOwnerTenantId(ownerId);
		const config = await this.getConfigRows(orgId);

		return {
			orgId,
			...config,
		};
	}
}
