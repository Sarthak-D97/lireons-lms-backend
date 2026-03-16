import { Module, Global } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export const PRISMA_SERVICE = 'PRISMA_SERVICE';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('DATABASE_URL is required to initialize PrismaClient');
        }

        const adapter = new PrismaPg({ connectionString });
        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: [PRISMA_SERVICE],
})
export class DatabaseModule {}
