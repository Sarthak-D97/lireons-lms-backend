import { Module } from '@nestjs/common';
import { SalesLeadController } from './sales_lead.controller';
import { SalesLeadService } from './sales_lead.service';

@Module({
  controllers: [SalesLeadController],
  providers: [SalesLeadService]
})
export class SalesLeadModule {}
