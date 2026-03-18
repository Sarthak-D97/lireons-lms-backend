import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@repo/auth';
import type { JwtAuthUser } from '@lireons/shared-types';
import { SaasPaymentService } from './saas-payment.service';
import { RazorpayService } from './razorpay.service';
import { PaymentInitiateDto } from './dto/payment-initiate.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

@Controller('core-saas/payments')
export class PaymentController {
  constructor(
    private readonly saasPaymentService: SaasPaymentService,
    private readonly razorpayService: RazorpayService,
  ) {}

  private requireOwnerId(req: { user: JwtAuthUser }) {
    const ownerId = req.user?.ownerId;
    if (!ownerId) {
      throw new UnauthorizedException(
        'Tenant owner context is missing. Complete owner onboarding first.',
      );
    }
    return ownerId;
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Body() payload: PaymentInitiateDto,
    @Request() req: { user: JwtAuthUser },
  ) {
    const ownerId = this.requireOwnerId(req);

    return this.saasPaymentService.initiatePayment({
      invoiceId: payload.invoiceId,
      ownerId,
    });
  }

  @Post('callback')
  @UseGuards(JwtAuthGuard)
  async handlePaymentCallback(
    @Body() payload: PaymentCallbackDto,
    @Headers('x-razorpay-signature') signature: string,
    @Request() req: { user: JwtAuthUser },
  ) {
    const ownerId = this.requireOwnerId(req);

    return this.saasPaymentService.handlePaymentCallback(payload, ownerId);
  }

  @Post('webhook')
  async handleWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const bodyString = JSON.stringify(body);

    const isValid = this.razorpayService.verifyWebhookSignature(
      bodyString,
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return { received: true };
  }

  @Get('status/:invoiceId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param('invoiceId') invoiceId: string,
    @Request() req: { user: JwtAuthUser },
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.saasPaymentService.getPaymentStatus(invoiceId, ownerId);
  }
}
