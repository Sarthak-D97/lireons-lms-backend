import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@repo/auth';
import { join } from 'path';
import configuration from './config/configuration';
import { SalesLeadModule } from './sales_lead/sales_lead.module';
import { CoreSaasModule } from './core-saas/core-saas.module';
import { DatabaseModule } from '@lireons/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
    }),
    AuthModule,
    CoreSaasModule,
    DatabaseModule,
    SalesLeadModule,
  ],
})
export class AppModule { }
