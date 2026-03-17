import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { promises as dns } from 'node:dns';
import { randomBytes } from 'node:crypto';
import { extname } from 'node:path';
import { PRISMA_SERVICE, PrismaClient } from '@lireons/database';
import { Prisma } from '@lireons/database';
import type { CreateTenantWithOwner } from '@lireons/shared-types';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
	TenantConfigurationDto,
} from './dto/tenant-configuration.dto';
import {
	UpdateTenantConfigurationDto,
} from './dto/update-tenant-configuration.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { S3UploadService } from './s3-upload.service';

export type UploadImageFile = {
	originalname: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
};

type DomainMeta = {
	status: 'PENDING_VERIFICATION' | 'VERIFIED';
	verificationToken: string;
	cnameTarget: string;
	txtHost: string;
	txtValue: string;
	startedAt: string;
	lastCheckedAt?: string;
	verifiedAt?: string;
	lastErrors?: string[];
};

@Injectable()
export class TenantService {
	constructor(
		@Inject(PRISMA_SERVICE)
		private readonly prisma: PrismaClient,
		private readonly s3UploadService: S3UploadService,
	) {}

	private readonly allowedImageMimeTypes = new Set([
		'image/png',
		'image/jpeg',
		'image/jpg',
		'image/webp',
		'image/svg+xml',
	]);

	private readonly maxUploadBytes = 5 * 1024 * 1024;

	private validateImageFile(file: UploadImageFile) {
		if (!file) {
			throw new BadRequestException('File is required. Use multipart/form-data with field name "file".');
		}

		if (!this.allowedImageMimeTypes.has(file.mimetype)) {
			throw new BadRequestException(
				'Unsupported file type. Allowed types: png, jpg, jpeg, webp, svg.',
			);
		}

		if (file.size > this.maxUploadBytes) {
			throw new BadRequestException('File too large. Maximum allowed size is 5MB.');
		}
	}

	private buildS3Key(orgId: string, file: UploadImageFile, type: 'logo' | 'app-icon') {
		const extension = extname(file.originalname || '').toLowerCase();
		const safeExt = extension && extension.length <= 10 ? extension : '.png';
		const randomSuffix = randomBytes(8).toString('hex');
		return `organizations/${orgId}/${type}/${Date.now()}-${randomSuffix}${safeExt}`;
	}

	getActivePlans() {
		return this.prisma.saasPlan.findMany({
			where: { isActive: true },
			select: {
				id: true,
				name: true,
				billingCycle: true,
				price: true,
				maxStudentsAllowed: true,
				maxStorageGb: true,
				hasWhiteLabelApp: true,
			},
			orderBy: [{ name: 'asc' }, { billingCycle: 'asc' }],
		});
	}

	create(createTenantDto: CreateTenantDto, ownerId: string) {
		const { phone, billingAddress, taxId, planId, ...tenantData } =
			createTenantDto;

		const normalizedSubdomain = tenantData.subdomain.trim().toLowerCase();
		const normalizedCustomDomain = tenantData.customDomain
			? this.normalizeCustomDomain(tenantData.customDomain)
			: undefined;

		const tenantPayload: CreateTenantWithOwner = {
			...tenantData,
			subdomain: normalizedSubdomain,
			customDomain: normalizedCustomDomain,
			ownerId,
		};

		return this.prisma.$transaction(async (tx) => {
			const existingTenant = await tx.tenantOrganization.findFirst({
				where: { ownerId },
				select: { id: true },
			});

			const subdomainConflict = await tx.tenantOrganization.findFirst({
				where: {
					subdomain: normalizedSubdomain,
					NOT: existingTenant ? { id: existingTenant.id } : undefined,
				},
				select: { id: true },
			});

			if (subdomainConflict) {
				throw new BadRequestException(
					`Subdomain ${normalizedSubdomain} is already in use`,
				);
			}

			if (normalizedCustomDomain) {
				const customDomainConflict = await tx.tenantOrganization.findFirst({
					where: {
						customDomain: normalizedCustomDomain,
						NOT: existingTenant ? { id: existingTenant.id } : undefined,
					},
					select: { id: true },
				});

				if (customDomainConflict) {
					throw new BadRequestException(
						`Custom domain ${normalizedCustomDomain} is already in use`,
					);
				}
			}

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

			const tenant = existingTenant
				? await tx.tenantOrganization.update({
						where: { id: existingTenant.id },
						data: {
							orgName: tenantPayload.orgName,
							orgType: tenantPayload.orgType,
							subdomain: tenantPayload.subdomain,
							customDomain: normalizedCustomDomain,
							status: tenantPayload.status,
							dbRoutingKey: tenantPayload.dbRoutingKey,
						},
					})
				: await tx.tenantOrganization.create({
						data: tenantPayload,
					});

			if (!planId) {
				return { tenant };
			}

			const plan = await tx.saasPlan.findFirst({
				where: {
					id: planId,
					isActive: true,
				},
			});

			if (!plan) {
				throw new BadRequestException('Selected plan is invalid or inactive');
			}

			const existingSubscription = await tx.subscription.findUnique({
				where: { tenantId: tenant.id },
				select: {
					id: true,
					status: true,
					planId: true,
				},
			});

			if (existingSubscription) {
				const latestInvoice = await tx.invoice.findFirst({
					where: { subId: existingSubscription.id },
					orderBy: { issuedAt: 'desc' },
					select: {
						id: true,
						status: true,
						transaction: {
							select: {
								id: true,
								status: true,
							},
						},
					},
				});

				return {
					tenant,
					subscription: existingSubscription,
					payment: {
						status: latestInvoice?.transaction?.status || 'PENDING',
						transactionId: latestInvoice?.transaction?.id || null,
						invoiceId: latestInvoice?.id || null,
						reused: true,
					},
				};
			}

			const now = new Date();
			const currentPeriodEnd = new Date(now);
			if (plan.billingCycle === 'YEARLY') {
				currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
			} else {
				currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
			}

			const trialEndsAt = new Date(now);
			trialEndsAt.setDate(trialEndsAt.getDate() + 14);

			const subscription = await tx.subscription.create({
				data: {
					tenantId: tenant.id,
					planId: plan.id,
					status: 'TRIAL',
					trialEndsAt,
					currentPeriodStart: now,
					currentPeriodEnd,
					cancelAtPeriodEnd: false,
				},
			});

			const zeroAmount = new Prisma.Decimal(0);
			const invoice = await tx.invoice.create({
				data: {
					subId: subscription.id,
					ownerId,
					subtotal: plan.price,
					taxAmount: zeroAmount,
					total: plan.price,
					currency: 'INR',
					status: 'DRAFT',
				},
			});

			const transaction = await tx.saasPaymentTransaction.create({
				data: {
					invoiceId: invoice.id,
					gateway: 'STRIPE',
					amountPaid: zeroAmount,
					status: 'PENDING',
				},
			});

			return {
				tenant,
				subscription,
				invoice,
				payment: {
					status: 'PENDING',
					transactionId: transaction.id,
					invoiceId: invoice.id,
				},
			};
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

	private normalizeCustomDomain(input: string): string {
		let value = input.trim().toLowerCase();

		if (!value) {
			throw new BadRequestException('Custom domain is required');
		}

		if (value.startsWith('http://') || value.startsWith('https://')) {
			try {
				const parsed = new URL(value);
				value = parsed.hostname.toLowerCase();
			} catch {
				throw new BadRequestException('Invalid custom domain');
			}
		}

		value = value.replace(/\.$/, '');

		const domainRegex = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
		if (!domainRegex.test(value)) {
			throw new BadRequestException('Invalid custom domain format');
		}

		return value;
	}

	private parseDomainMeta(dbRoutingKey?: string | null): DomainMeta | null {
		if (!dbRoutingKey) return null;

		try {
			const parsed = JSON.parse(dbRoutingKey) as {
				__lireonsDomain?: DomainMeta;
			};
			return parsed.__lireonsDomain ?? null;
		} catch {
			return null;
		}
	}

	private mergeDomainMetaIntoRoutingKey(
		currentRoutingKey: string | null,
		meta: DomainMeta,
	): string {
		let payload: Record<string, unknown> = {};

		if (currentRoutingKey) {
			try {
				const parsed = JSON.parse(currentRoutingKey) as Record<string, unknown>;
				payload = parsed;
			} catch {
				payload.routingKeyOriginal = currentRoutingKey;
			}
		}

		payload.__lireonsDomain = meta;
		return JSON.stringify(payload);
	}

	async startCustomDomainVerification(ownerId: string, customDomainInput: string) {
		const orgId = await this.findOwnerTenantId(ownerId);
		const customDomain = this.normalizeCustomDomain(customDomainInput);

		const conflictTenant = await this.prisma.tenantOrganization.findFirst({
			where: {
				customDomain,
				NOT: { id: orgId },
			},
			select: {
				id: true,
				orgName: true,
			},
		});

		if (conflictTenant) {
			throw new BadRequestException(
				`Custom domain ${customDomain} is already in use by another organization`,
			);
		}

		const cnameTarget =
			process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'tenant-edge.lireons.com';
		const token = randomBytes(16).toString('hex');
		const txtHost = `_lireons-verify.${customDomain}`;
		const txtValue = `lireons-verify=${token}`;

		const existing = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: { dbRoutingKey: true },
		});

		const domainMeta: DomainMeta = {
			status: 'PENDING_VERIFICATION',
			verificationToken: token,
			cnameTarget,
			txtHost,
			txtValue,
			startedAt: new Date().toISOString(),
			lastErrors: [],
		};

		await this.prisma.tenantOrganization.update({
			where: { id: orgId },
			data: {
				customDomain,
				dbRoutingKey: this.mergeDomainMetaIntoRoutingKey(
					existing?.dbRoutingKey || null,
					domainMeta,
				),
			},
		});

		return {
			orgId,
			customDomain,
			status: domainMeta.status,
			dnsInstructions: {
				cname: {
					host: customDomain,
					value: cnameTarget,
				},
				txt: {
					host: txtHost,
					value: txtValue,
				},
			},
		};
	}

	async verifyCustomDomain(ownerId: string) {
		const orgId = await this.findOwnerTenantId(ownerId);

		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: {
				customDomain: true,
				dbRoutingKey: true,
			},
		});

		if (!tenant?.customDomain) {
			throw new BadRequestException('No custom domain found for this tenant');
		}

		const meta = this.parseDomainMeta(tenant.dbRoutingKey);
		if (!meta) {
			throw new BadRequestException(
				'Domain verification was not initialized. Call start endpoint first.',
			);
		}

		const target = meta.cnameTarget.replace(/\.$/, '').toLowerCase();
		const errors: string[] = [];
		let txtVerified = false;
		let cnameVerified = false;

		try {
			const txtRecords = await dns.resolveTxt(meta.txtHost);
			const flatTxt = txtRecords
				.map((row) => row.join(''))
				.map((row) => row.toLowerCase());
			txtVerified = flatTxt.includes(meta.txtValue.toLowerCase());
			if (!txtVerified) {
				errors.push('TXT verification token not found');
			}
		} catch {
			errors.push('TXT record not found yet');
		}

		try {
			const cnameRecords = await dns.resolveCname(tenant.customDomain);
			cnameVerified = cnameRecords.some(
				(record) => record.replace(/\.$/, '').toLowerCase() === target,
			);
			if (!cnameVerified) {
				errors.push('CNAME target does not match expected value');
			}
		} catch {
			errors.push('CNAME record not found yet');
		}

		const verified = txtVerified && cnameVerified;
		const updatedMeta: DomainMeta = {
			...meta,
			status: verified ? 'VERIFIED' : 'PENDING_VERIFICATION',
			lastCheckedAt: new Date().toISOString(),
			verifiedAt: verified ? new Date().toISOString() : meta.verifiedAt,
			lastErrors: errors,
		};

		await this.prisma.tenantOrganization.update({
			where: { id: orgId },
			data: {
				dbRoutingKey: this.mergeDomainMetaIntoRoutingKey(
					tenant.dbRoutingKey,
					updatedMeta,
				),
			},
		});

		return {
			orgId,
			customDomain: tenant.customDomain,
			status: updatedMeta.status,
			verification: {
				txtVerified,
				cnameVerified,
				errors,
			},
			dnsInstructions: {
				cname: {
					host: tenant.customDomain,
					value: updatedMeta.cnameTarget,
				},
				txt: {
					host: updatedMeta.txtHost,
					value: updatedMeta.txtValue,
				},
			},
		};
	}

	async getCustomDomainStatus(ownerId: string) {
		const orgId = await this.findOwnerTenantId(ownerId);
		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: {
				customDomain: true,
				dbRoutingKey: true,
			},
		});

		if (!tenant) {
			throw new NotFoundException('Tenant not found');
		}

		const meta = this.parseDomainMeta(tenant.dbRoutingKey);
		if (!tenant.customDomain || !meta) {
			return {
				orgId,
				configured: false,
			};
		}

		return {
			orgId,
			configured: true,
			customDomain: tenant.customDomain,
			status: meta.status,
			lastCheckedAt: meta.lastCheckedAt,
			verifiedAt: meta.verifiedAt,
			dnsInstructions: {
				cname: {
					host: tenant.customDomain,
					value: meta.cnameTarget,
				},
				txt: {
					host: meta.txtHost,
					value: meta.txtValue,
				},
			},
			errors: meta.lastErrors || [],
		};
	}

	async deployTenant(ownerId: string) {
		const orgId = await this.findOwnerTenantId(ownerId);
		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: {
				id: true,
				orgName: true,
				customDomain: true,
				dbRoutingKey: true,
				status: true,
			},
		});

		if (!tenant) {
			throw new NotFoundException('Tenant not found');
		}

		if (tenant.customDomain) {
			const meta = this.parseDomainMeta(tenant.dbRoutingKey);
			if (!meta || meta.status !== 'VERIFIED') {
				throw new BadRequestException(
					'Custom domain is configured but not verified yet. Verify DNS before deploying.',
				);
			}
		}

		const deployed = await this.prisma.tenantOrganization.update({
			where: { id: tenant.id },
			data: {
				status: 'ACTIVE',
			},
			select: {
				id: true,
				orgName: true,
				status: true,
				customDomain: true,
				subdomain: true,
			},
		});

		return {
			message: 'Tenant deployed successfully',
			deployment: deployed,
		};
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

			const design = tenantConfigurationDto.design
				? await tx.organizationDesign.upsert({
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
					})
				: null;

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

	async uploadOrganizationLogo(ownerId: string, file: UploadImageFile) {
		this.validateImageFile(file);
		const orgId = await this.findOwnerTenantId(ownerId);
		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: { orgName: true },
		});
		const key = this.buildS3Key(orgId, file, 'logo');
		const logoUrl = await this.s3UploadService.uploadPublicFile(file, key);

		const settings = await this.prisma.organizationSettings.upsert({
			where: { orgId },
			create: {
				orgId,
				serviceName: tenant?.orgName || 'Organization Service',
				logoUrl,
			},
			update: {
				logoUrl,
			},
		});

		return {
			orgId,
			logoUrl,
			settings,
		};
	}

	async uploadAppIcon(ownerId: string, file: UploadImageFile) {
		this.validateImageFile(file);
		const orgId = await this.findOwnerTenantId(ownerId);
		const tenant = await this.prisma.tenantOrganization.findUnique({
			where: { id: orgId },
			select: { orgName: true, subdomain: true },
		});
		const key = this.buildS3Key(orgId, file, 'app-icon');
		const appIconUrl = await this.s3UploadService.uploadPublicFile(file, key);

		const appSettings = await this.prisma.organizationAppSettings.upsert({
			where: { orgId },
			create: {
				orgId,
				appName: tenant?.orgName || 'Organization App',
				packageName: `com.lireons.${
					(tenant?.subdomain || orgId.replace(/-/g, '')).replace(/[^a-z0-9]/g, '')
				}`,
				appIconUrl,
				appStatus: 'BUILDING',
				allowOfflineDownload: false,
				maxDevicesPerUser: 2,
			},
			update: {
				appIconUrl,
			},
		});

		return {
			orgId,
			appIconUrl,
			appSettings,
		};
	}
}
