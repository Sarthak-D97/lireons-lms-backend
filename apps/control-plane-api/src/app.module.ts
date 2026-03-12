import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { CoreSaasModule } from './core-saas/core-saas.module';
import { DatabaseModule } from '@lireons/database';
import { CacheModule } from '@lireons/cache';
import { QueueModule } from '@lireons/queue';
import { SalesLeadModule } from './sales_lead/sales_lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env.local'), join(process.cwd(), '.env')],
    }),
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
