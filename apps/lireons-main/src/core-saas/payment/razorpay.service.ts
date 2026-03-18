import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Razorpay {
    if (this.razorpay) {
      return this.razorpay;
    }

    const keyId = this.configService.get<string>('razorpay.keyId');
    const keySecret = this.configService.get<string>('razorpay.keySecret');

    if (!keyId || !keySecret) {
      throw new InternalServerErrorException(
        'Razorpay configuration is missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    return this.razorpay;
  }

  getPublicKey(): string {
    const keyId = this.configService.get<string>('razorpay.keyId');
    if (!keyId) {
      throw new InternalServerErrorException(
        'Razorpay key id is missing. Set RAZORPAY_KEY_ID.',
      );
    }

    return keyId;
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, any>,
  ) {
    try {
      const order = await this.getClient().orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
      });
      return order;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Razorpay error';
      throw new Error(`Razorpay order creation failed: ${message}`);
    }
  }

  async fetchOrder(orderId: string) {
    try {
      const order = await this.getClient().orders.fetch(orderId);
      return order;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Razorpay error';
      throw new Error(`Failed to fetch Razorpay order: ${message}`);
    }
  }

  async fetchPayment(paymentId: string) {
    try {
      const payment = await this.getClient().payments.fetch(paymentId);
      return payment;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Razorpay error';
      throw new Error(`Failed to fetch Razorpay payment: ${message}`);
    }
  }

  async capturePayment(paymentId: string, amount: number, currency: string = 'INR') {
    try {
      const capture = await this.getClient().payments.capture(
        paymentId,
        Math.round(amount * 100), // Convert to paise
        currency,
      );
      return capture;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Razorpay error';
      throw new Error(`Razorpay payment capture failed: ${message}`);
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await this.getClient().payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Razorpay error';
      throw new Error(`Razorpay refund failed: ${message}`);
    }
  }

  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const keySecret = this.configService.get<string>('razorpay.keySecret');
    if (!keySecret) {
      throw new Error('Razorpay key secret is not configured');
    }
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  verifyWebhookSignature(
    webhookBody: string,
    webhookSignature: string,
  ): boolean {
    const webhookSecret = this.configService.get<string>(
      'razorpay.webhookSecret',
    );
    if (!webhookSecret) {
      throw new Error('Razorpay webhook secret is not configured');
    }
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
  }
}
