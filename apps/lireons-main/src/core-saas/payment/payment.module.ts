import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { SaasPaymentService } from './saas-payment.service';
import { PaymentController } from './payment.controller';
import { BillingController } from './billing.controller';

@Module({
  providers: [RazorpayService, SaasPaymentService],
  controllers: [PaymentController, BillingController],
  exports: [RazorpayService, SaasPaymentService],
})
export class PaymentModule {}
