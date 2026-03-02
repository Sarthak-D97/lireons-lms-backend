import { Module } from '@nestjs/common';
import { CoreSaasModule } from './core-saas/core-saas.module';
import { DatabaseModule } from '@lireons/database';
import { CacheModule } from '@lireons/cache';
import { QueueModule } from '@lireons/queue';

@Module({
  imports: [
    CoreSaasModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
