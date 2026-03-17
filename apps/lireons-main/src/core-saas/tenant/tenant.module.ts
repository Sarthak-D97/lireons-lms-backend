import { Module } from '@nestjs/common';
import { DatabaseModule } from '@lireons/database';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { S3UploadService } from './s3-upload.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [TenantService, S3UploadService],
  exports: [TenantService],
})
export class TenantModule {}
