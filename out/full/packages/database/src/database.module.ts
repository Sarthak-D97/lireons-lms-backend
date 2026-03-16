import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const PRISMA_SERVICE = 'PRISMA_SERVICE';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useFactory: () => {
        return new PrismaClient();
      },
    },
  ],
  exports: [PRISMA_SERVICE],
})
export class DatabaseModule {}
