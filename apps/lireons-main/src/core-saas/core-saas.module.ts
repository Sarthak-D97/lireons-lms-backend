import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [TenantModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class CoreSaasModule {}
