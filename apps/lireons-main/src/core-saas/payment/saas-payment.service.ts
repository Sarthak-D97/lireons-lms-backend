import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA_SERVICE, Prisma, PrismaClient } from '@lireons/database';
import { RazorpayService } from './razorpay.service';
import { CreateSaasPlanDto, PlanListQueryDto, UpdateSaasPlanDto } from './dto/plan.dto';
import { CreateInvoiceDto, InvoiceListQueryDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { CreateTransactionDto, TransactionListQueryDto, UpdateTransactionDto } from './dto/transaction.dto';
import type { PaymentCallbackDto } from './dto/payment-callback.dto';

export interface PaymentInitiationPayload {
  invoiceId: string;
  ownerId: string;
}

@Injectable()
export class SaasPaymentService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient,
    private readonly razorpayService: RazorpayService,
  ) {}

  async listPlans(query: PlanListQueryDto) {
    const includeInactive = query.includeInactive === 'true';

    return this.prisma.saasPlan.findMany({
      where: {
        isActive: includeInactive ? undefined : true,
        billingCycle: query.billingCycle,
        name: query.search
          ? {
              contains: query.search,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: [{ name: 'asc' }, { billingCycle: 'asc' }],
    });
  }

  async createPlan(payload: CreateSaasPlanDto) {
    return this.prisma.saasPlan.create({
      data: {
        slug: payload.slug,
        name: payload.name,
        billingCycle: payload.billingCycle,
        price: new Prisma.Decimal(payload.price),
        maxStudentsAllowed: payload.maxStudentsAllowed,
        maxStorageGb: payload.maxStorageGb,
        hasWhiteLabelApp: payload.hasWhiteLabelApp ?? false,
        isActive: payload.isActive ?? true,
      },
    });
  }

  async updatePlan(id: string, payload: UpdateSaasPlanDto) {
    await this.assertPlanExists(id);

    return this.prisma.saasPlan.update({
      where: { id },
      data: {
        slug: payload.slug,
        name: payload.name,
        billingCycle: payload.billingCycle,
        price:
          typeof payload.price === 'number'
            ? new Prisma.Decimal(payload.price)
            : undefined,
        maxStudentsAllowed: payload.maxStudentsAllowed,
        maxStorageGb: payload.maxStorageGb,
        hasWhiteLabelApp: payload.hasWhiteLabelApp,
        isActive: payload.isActive,
      },
    });
  }

  async getOwnerInvoices(ownerId: string, query: InvoiceListQueryDto) {
    return this.prisma.invoice.findMany({
      where: {
        ownerId,
        status: query.status,
        subId: query.subId,
      },
      include: {
        subscription: {
          include: {
            tenant: {
              select: {
                id: true,
                orgName: true,
                subdomain: true,
                status: true,
              },
            },
            plan: true,
          },
        },
        transaction: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getOwnerInvoiceById(ownerId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        ownerId,
      },
      include: {
        subscription: {
          include: {
            tenant: true,
            plan: true,
          },
        },
        owner: true,
        transaction: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async createOwnerInvoice(ownerId: string, payload: CreateInvoiceDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: payload.subId,
        tenant: {
          ownerId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found for owner');
    }

    const subtotal = new Prisma.Decimal(payload.subtotal);
    const taxAmount = new Prisma.Decimal(payload.taxAmount);
    const total =
      typeof payload.total === 'number'
        ? new Prisma.Decimal(payload.total)
        : subtotal.plus(taxAmount);

    return this.prisma.invoice.create({
      data: {
        subId: payload.subId,
        ownerId,
        subtotal,
        taxAmount,
        total,
        currency: payload.currency ?? 'INR',
        status: payload.status ?? 'DRAFT',
        pdfUrl: payload.pdfUrl,
        issuedAt: payload.issuedAt ? new Date(payload.issuedAt) : undefined,
      },
      include: {
        transaction: true,
      },
    });
  }

  async updateOwnerInvoice(ownerId: string, invoiceId: string, payload: UpdateInvoiceDto) {
    const existingInvoice = await this.assertOwnerInvoice(ownerId, invoiceId);

    return this.prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        subtotal:
          typeof payload.subtotal === 'number'
            ? new Prisma.Decimal(payload.subtotal)
            : undefined,
        taxAmount:
          typeof payload.taxAmount === 'number'
            ? new Prisma.Decimal(payload.taxAmount)
            : undefined,
        total:
          typeof payload.total === 'number'
            ? new Prisma.Decimal(payload.total)
            : undefined,
        currency: payload.currency,
        status: payload.status,
        pdfUrl: payload.pdfUrl,
        issuedAt: payload.issuedAt ? new Date(payload.issuedAt) : undefined,
      },
      include: {
        transaction: true,
      },
    });
  }

  async getOwnerTransactions(ownerId: string, query: TransactionListQueryDto) {
    return this.prisma.saasPaymentTransaction.findMany({
      where: {
        gateway: query.gateway,
        status: query.status,
        invoiceId: query.invoiceId,
        invoice: {
          ownerId,
        },
      },
      include: {
        invoice: {
          include: {
            subscription: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    orgName: true,
                  },
                },
                plan: true,
              },
            },
          },
        },
      },
      orderBy: { processedAt: 'desc' },
    });
  }

  async getOwnerTransactionById(ownerId: string, transactionId: string) {
    const transaction = await this.prisma.saasPaymentTransaction.findFirst({
      where: {
        id: transactionId,
        invoice: {
          ownerId,
        },
      },
      include: {
        invoice: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async createOwnerTransaction(ownerId: string, payload: CreateTransactionDto) {
    await this.assertOwnerInvoice(ownerId, payload.invoiceId);

    return this.prisma.saasPaymentTransaction.create({
      data: {
        invoiceId: payload.invoiceId,
        gateway: payload.gateway,
        gatewayPaymentId: payload.gatewayPaymentId,
        amountPaid: new Prisma.Decimal(payload.amountPaid),
        status: payload.status,
        processedAt: payload.processedAt
          ? new Date(payload.processedAt)
          : undefined,
      },
    });
  }

  async updateOwnerTransaction(
    ownerId: string,
    transactionId: string,
    payload: UpdateTransactionDto,
  ) {
    const transaction = await this.assertOwnerTransaction(ownerId, transactionId);

    return this.prisma.saasPaymentTransaction.update({
      where: { id: transaction.id },
      data: {
        gateway: payload.gateway,
        gatewayPaymentId: payload.gatewayPaymentId,
        amountPaid:
          typeof payload.amountPaid === 'number'
            ? new Prisma.Decimal(payload.amountPaid)
            : undefined,
        status: payload.status,
        processedAt: payload.processedAt
          ? new Date(payload.processedAt)
          : undefined,
      },
      include: {
        invoice: true,
      },
    });
  }

  async initiatePayment(payload: PaymentInitiationPayload) {
    const { invoiceId, ownerId } = payload;
    const invoice = await this.assertOwnerInvoice(ownerId, invoiceId);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice already paid');
    }

    const order = await this.razorpayService.createOrder(
      invoice.total.toNumber(),
      invoice.currency,
      invoice.id,
      {
        invoiceId: invoice.id,
        ownerId,
        subId: invoice.subId,
      },
    );

    const existingTransaction = await this.prisma.saasPaymentTransaction.findUnique({
      where: { invoiceId: invoice.id },
    });

    const transaction = existingTransaction
      ? await this.prisma.saasPaymentTransaction.update({
          where: { id: existingTransaction.id },
          data: {
            gateway: 'RAZORPAY',
            gatewayPaymentId: order.id,
            status: 'PENDING',
          },
        })
      : await this.prisma.saasPaymentTransaction.create({
          data: {
            invoiceId: invoice.id,
            gateway: 'RAZORPAY',
            gatewayPaymentId: order.id,
            amountPaid: new Prisma.Decimal(0),
            status: 'PENDING',
          },
        });

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: invoice.status === 'PAID' ? 'PAID' : 'OPEN',
      },
    });

    return {
      orderId: order.id,
      invoiceId: invoice.id,
      amount: invoice.total.toNumber(),
      currency: invoice.currency,
      transactionId: transaction.id,
      gateway: transaction.gateway,
    };
  }

  async handlePaymentCallback(payload: PaymentCallbackDto, ownerId: string) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload;

    const isValid = this.razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const transaction = await this.prisma.saasPaymentTransaction.findFirst({
      where: {
        gateway: 'RAZORPAY',
        gatewayPaymentId: razorpay_order_id,
        invoice: {
          ownerId,
        },
      },
      include: {
        invoice: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction for this order was not found');
    }

    const payment = await this.razorpayService.fetchPayment(razorpay_payment_id);
    const amountInRupees = Number(payment.amount) / 100;

    const updatedTransaction = await this.prisma.saasPaymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: payment.status === 'captured' || payment.status === 'authorized' ? 'SUCCESS' : 'FAILED',
        gatewayPaymentId: razorpay_payment_id,
        amountPaid: new Prisma.Decimal(amountInRupees),
        processedAt: new Date(),
      },
    });

    await this.prisma.invoice.update({
      where: { id: transaction.invoice.id },
      data: {
        status: updatedTransaction.status === 'SUCCESS' ? 'PAID' : 'PAST_DUE',
      },
    });

    if (
      updatedTransaction.status === 'SUCCESS' &&
      (transaction.invoice.subscription.status === 'TRIAL' ||
        transaction.invoice.subscription.status === 'PAST_DUE')
    ) {
      await this.prisma.subscription.update({
        where: { id: transaction.invoice.subscription.id },
        data: {
          status: 'ACTIVE',
        },
      });
    }

    return {
      success: updatedTransaction.status === 'SUCCESS',
      transactionId: updatedTransaction.id,
      invoiceId: transaction.invoice.id,
      amountPaid: updatedTransaction.amountPaid,
      status: updatedTransaction.status,
    };
  }

  async getPaymentStatus(invoiceId: string, ownerId: string) {
    const invoice = await this.assertOwnerInvoice(ownerId, invoiceId);

    return {
      id: invoice.id,
      subId: invoice.subId,
      ownerId: invoice.ownerId,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      pdfUrl: invoice.pdfUrl,
      issuedAt: invoice.issuedAt,
      updatedAt: invoice.updatedAt,
      payment: invoice.transaction
        ? {
            id: invoice.transaction.id,
            gateway: invoice.transaction.gateway,
            gatewayPaymentId: invoice.transaction.gatewayPaymentId,
            amountPaid: invoice.transaction.amountPaid,
            status: invoice.transaction.status,
            processedAt: invoice.transaction.processedAt,
            updatedAt: invoice.transaction.updatedAt,
          }
        : null,
    };
  }

  private async assertPlanExists(id: string) {
    const plan = await this.prisma.saasPlan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!plan) {
      throw new NotFoundException('SaaS plan not found');
    }

    return plan;
  }

  private async assertOwnerInvoice(ownerId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        ownerId,
      },
      include: {
        transaction: true,
        subscription: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  private async assertOwnerTransaction(ownerId: string, transactionId: string) {
    const transaction = await this.prisma.saasPaymentTransaction.findFirst({
      where: {
        id: transactionId,
        invoice: {
          ownerId,
        },
      },
      include: {
        invoice: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
