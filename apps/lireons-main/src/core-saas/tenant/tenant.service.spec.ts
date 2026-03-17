import { Test, TestingModule } from '@nestjs/testing';
import { PRISMA_SERVICE } from '@lireons/database';
import { TenantService } from './tenant.service';
import { S3UploadService } from './s3-upload.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: PRISMA_SERVICE,
          useValue: {
            tenantOrganization: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: S3UploadService,
          useValue: {
            uploadPublicFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
