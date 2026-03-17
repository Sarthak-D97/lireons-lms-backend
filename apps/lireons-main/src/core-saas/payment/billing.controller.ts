import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@repo/auth';
import type { JwtAuthUser } from '@lireons/shared-types';
import { SaasPaymentService } from './saas-payment.service';
import {
  CreateSaasPlanDto,
  PlanListQueryDto,
  UpdateSaasPlanDto,
} from './dto/plan.dto';
import {
  CreateInvoiceDto,
  InvoiceListQueryDto,
  UpdateInvoiceDto,
} from './dto/invoice.dto';
import {
  CreateTransactionDto,
  TransactionListQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('core-saas/billing')
export class BillingController {
  constructor(private readonly paymentService: SaasPaymentService) {}

  private requireOwnerId(req: { user: JwtAuthUser }) {
    const ownerId = req.user?.ownerId;
    if (!ownerId) {
      throw new UnauthorizedException(
        'Tenant owner context is missing. Complete owner onboarding first.',
      );
    }
    return ownerId;
  }

  @Get('plans')
  async listPlans(@Query() query: PlanListQueryDto) {
    return this.paymentService.listPlans(query);
  }

  @Post('plans')
  async createPlan(@Body() payload: CreateSaasPlanDto) {
    return this.paymentService.createPlan(payload);
  }

  @Patch('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() payload: UpdateSaasPlanDto) {
    return this.paymentService.updatePlan(id, payload);
  }

  @Get('invoices')
  async getOwnerInvoices(
    @Request() req: { user: JwtAuthUser },
    @Query() query: InvoiceListQueryDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.getOwnerInvoices(ownerId, query);
  }

  @Get('invoices/:id')
  async getOwnerInvoiceById(
    @Request() req: { user: JwtAuthUser },
    @Param('id') id: string,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.getOwnerInvoiceById(ownerId, id);
  }

  @Post('invoices')
  async createOwnerInvoice(
    @Request() req: { user: JwtAuthUser },
    @Body() payload: CreateInvoiceDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.createOwnerInvoice(ownerId, payload);
  }

  @Patch('invoices/:id')
  async updateOwnerInvoice(
    @Request() req: { user: JwtAuthUser },
    @Param('id') id: string,
    @Body() payload: UpdateInvoiceDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.updateOwnerInvoice(ownerId, id, payload);
  }

  @Get('transactions')
  async getOwnerTransactions(
    @Request() req: { user: JwtAuthUser },
    @Query() query: TransactionListQueryDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.getOwnerTransactions(ownerId, query);
  }

  @Get('transactions/:id')
  async getOwnerTransactionById(
    @Request() req: { user: JwtAuthUser },
    @Param('id') id: string,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.getOwnerTransactionById(ownerId, id);
  }

  @Post('transactions')
  async createOwnerTransaction(
    @Request() req: { user: JwtAuthUser },
    @Body() payload: CreateTransactionDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.createOwnerTransaction(ownerId, payload);
  }

  @Patch('transactions/:id')
  async updateOwnerTransaction(
    @Request() req: { user: JwtAuthUser },
    @Param('id') id: string,
    @Body() payload: UpdateTransactionDto,
  ) {
    const ownerId = this.requireOwnerId(req);
    return this.paymentService.updateOwnerTransaction(ownerId, id, payload);
  }
}
