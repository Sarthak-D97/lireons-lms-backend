import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AcademyAdminModule } from './academy-admin/academy-admin.module';
import { AcademyLmsModule } from './academy-lms/academy-lms.module';
import { CommerceModule } from './commerce/commerce.module';
import { DatabaseModule } from '@lireons/database';
import { CacheModule } from '@lireons/cache';
import { QueueModule } from '@lireons/queue';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env.local'), join(process.cwd(), '.env')],
    }),
    AcademyAdminModule,
    AcademyLmsModule,
    CommerceModule,
    DatabaseModule,
    CacheModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
