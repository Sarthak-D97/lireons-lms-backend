import { Module } from '@nestjs/common';
import { CoreSaasModule } from './core-saas/core-saas.module';
import { DatabaseModule } from '@lireons/database';
import { CacheModule } from '@lireons/cache';
import { QueueModule } from '@lireons/queue';
import { SalesLeadModule } from './sales_lead/sales_lead.module';

@Module({
  imports: [
    CoreSaasModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
    SalesLeadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
