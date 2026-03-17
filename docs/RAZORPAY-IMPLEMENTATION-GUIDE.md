# Razorpay Integration Implementation Guide

## Overview

This guide explains how to integrate the Razorpay payment system into your Lireons SaaS application for processing subscription payments.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  PaymentStatusCard ──→ RazorpayPaymentForm                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (NestJS)                           │
│                                                              │
│  PaymentController                                          │
│   ├─ POST /initiate      ──→ SaasPaymentService            │
│   ├─ POST /callback      ──→ SaasPaymentService            │
│   ├─ GET  /status/:id    ──→ SaasPaymentService            │
│   └─ POST /webhook       ──→ RazorpayService               │
│                                    │                        │
│                                    ▼                        │
│                            RazorpayService                  │
│                     (Handles Razorpay API calls)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Razorpay API                             │
│              payment-gateway.razorpay.com                   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Environment Setup

1. Copy environment variables:
   ```bash
   cat .env.razorpay.example >> apps/lireons-main/.env.local
   cat .env.razorpay.example >> apps/lireons-frontend/.env.local
   ```

2. Update with your Razorpay credentials from:
   - [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Settings → API Keys
   - Settings → Webhooks

### Step 2: Backend Flow Integration

The payment flow is triggered when a user selects a SaaS plan:

```
User Selects Plan
    │
    ▼
Create Subscription + Invoice
    │
    ▼
Frontend: Display PaymentStatusCard
    │
    ▼
User Clicks "Pay Now"
    │
    ▼
Backend: POST /core-saas/payments/initiate
    ├─ Validates invoice
    ├─ Creates Razorpay order
    └─ Returns orderId
    │
    ▼
Frontend: Opens Razorpay checkout
    │
    ▼
User Completes Payment
    │
    ▼
Razorpay Redirects to Frontend
    │
    ▼
Backend: POST /core-saas/payments/callback
    ├─ Verifies signature
    ├─ Fetches payment details from Razorpay
    ├─ Updates Invoice status to PAID
    ├─ Updates Transaction with payment info
    └─ Updates Subscription status to ACTIVE
    │
    ▼
Frontend: Shows Success Message
```

### Step 3: Integration Points

#### Point A: After Creating Subscription

When a subscription is created in `TenantService.createSubscriptionAndInvoice()`:

```typescript
// In apps/lireons-main/src/core-saas/tenant/tenant.service.ts

async createSubscriptionAndInvoice(dto: CreateSubscriptionDto) {
  // ... existing code ...
  
  // After creating invoice and transaction:
  return {
    tenant,
    subscription,
    invoice,
    payment: {
      status: 'PENDING',
      transactionId: transaction.id,
      invoiceId: invoice.id,
      // NEW: Payment action required
      requiresPayment: true,
    },
  };
}
```

#### Point B: Frontend - Plan Selection Page

After user selects a plan, show:

```tsx
import PaymentStatusCard from '@/components/payments/PaymentStatusCard';

export default function PlanCheckout() {
  const { invoiceId } = useParams();
  
  return (
    <div>
      <h1>Complete Your Subscription</h1>
      <PaymentStatusCard 
        invoiceId={invoiceId}
        initialStatus="pending"
      />
    </div>
  );
}
```

#### Point C: Webhook Verification

Razorpay will call your webhook on payment events:

```
POST /core-saas/payments/webhook

Events handled:
- payment.authorized
- payment.failed
- order.paid
```

The webhook handler logs events (currently) but can be extended to:
- Send email confirmations
- Trigger provisioning
- Update user metrics
- Initiate onboarding flows

### Step 4: Testing the Integration

#### 1. Local Testing Setup

```bash
# Terminal 1: Backend
cd apps/lireons-main
pnpm run start:dev

# Terminal 2: Frontend
cd apps/lireons-frontend
pnpm run dev

# Terminal 3: Expose local URL (Razorpay webhook testing)
ngrok http 4000
# or use localtunnel:
lt --port 4000
```

#### 2. Update Webhook URL

In Razorpay Dashboard:
- Settings → Webhooks
- Update webhook URL to your ngrok/localtunnel URL
- Example: `https://xxxx.ngrok.io/core-saas/payments/webhook`

#### 3. Test Complete Flow

1. Go to plan selection page: `http://localhost:3000/pricing`
2. Select a plan
3. You'll be redirected to subscription with payment form
4. Click "Pay Now"
5. Use test card: `4111 1111 1111 1111`
6. Any future expiry and any CVC
7. Verify invoice status changes to PAID

### Step 5: Production Deployment

#### Before Going Live:

1. **Switch to Live Mode**:
   - Razorpay Dashboard → Settings → API Keys
   - Toggle from Test to Live
   - Update live keys in environment variables

2. **Webhook Configuration**:
   - Settings → Webhooks
   - Update webhook URL to production domain
   - Add webhook secret to production environment

3. **HTTPS Requirement**:
   - All payment endpoints must use HTTPS
   - Update frontend API URL to use `https://`

4. **PCI Compliance**:
   - Review security settings
   - Enable 2FA for Razorpay account
   - Regularly audit payment logs

5. **Testing with Real Cards**:
   - Razorpay will provide test cards for live mode
   - Process small transactions with test cards
   - Verify end-to-end flow

## Error Handling

### Common Scenarios

#### Scenario 1: Payment Fails
```
User clicks Pay → Razorpay checkout opens → User cancels/fails payment
→ Modal closes → User stays on payment page → Can retry
```

#### Scenario 2: Network Timeout
```
User completes payment → Network error during callback verification
→ Backend retries webhook from Razorpay
→ Eventually processes payment
```

#### Scenario 3: Duplicate Payment
```
User clicks Pay twice → Two orders created → Only one will succeed
→ Second callback will find invoice already PAID
→ Returns appropriate error
```

### Adding Error Handling

Update `PaymentStatusCard.tsx`:

```typescript
const handleError = (error: any) => {
  if (error.code === 'PAYMENT_ALREADY_PAID') {
    // Show success message
  } else if (error.code === 'NETWORK_ERROR') {
    // Show retry button
  } else {
    // Show generic error
  }
};
```

## Database Interactions

### Invoice Lifecycle

```
Invoice Created (status: DRAFT)
    │
    ├── SaasPaymentTransaction created (status: PENDING)
    │
    ▼
Payment Initiated
    │
    ├─ Razorpay Order created
    ├─ Transaction updated with orderId
    │
    ▼
Payment Completed
    │
    ├─ Invoice status: DRAFT → PAID
    ├─ Transaction status: PENDING → SUCCESS
    ├─ Transaction amountPaid updated
    └─ Subscription status: TRIAL → ACTIVE
```

### Query Payment History

```typescript
// Get all invoices for a subscription
const invoices = await prisma.invoice.findMany({
  where: { subId: subscriptionId },
  include: { transaction: true },
  orderBy: { issuedAt: 'desc' },
});

// Get payment transactions
const transactions = await prisma.saasPaymentTransaction.findMany({
  where: { invoice: { ownerId } },
  include: { invoice: true },
});
```

## Advanced Features (Future)

These can be added later:

1. **Automatic Retry**: Automatically retry failed payments
2. **Installments**: Break down payment into installments
3. **Subscription Management**: Allow cancellation/pausing
4. **Refunds**: Manual refund processing
5. **Invoices**: Generate and send PDF invoices
6. **Analytics**: Track payment metrics and conversion

## Support & Debugging

### Enable Debug Logging

Add to `RazorpayService`:
```typescript
private logger = new Logger('RazorpayService');

async createOrder(...) {
  this.logger.debug('Creating order:', { amount, currency, receipt });
  // ...
}
```

### View Razorpay Dashboard

- Transactions: [https://dashboard.razorpay.com/app/transactions](https://dashboard.razorpay.com/app/transactions)
- Orders: [https://dashboard.razorpay.com/app/orders](https://dashboard.razorpay.com/app/orders)
- Webhooks: [https://dashboard.razorpay.com/app/webhooks](https://dashboard.razorpay.com/app/webhooks)
- Logs: [https://dashboard.razorpay.com/app/logs](https://dashboard.razorpay.com/app/logs)

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid signature" | Wrong webhook secret | Verify `RAZORPAY_WEBHOOK_SECRET` in env |
| "Order not found" | Incorrect orderId | Check order creation response |
| "Payment declined" | Insufficient funds/fraud | Use test card in test mode |
| "Webhook not received" | Firewall/accessibility | Verify webhook URL is public |
| "409 Conflict" | Duplicate request | Implement idempotency keys |

## File Structure

```
apps/
  lireons-main/
    src/
      core-saas/
        payment/
          │
          ├─ razorpay.service.ts     # Razorpay API wrapper
          ├─ saas-payment.service.ts  # Business logic
          ├─ payment.controller.ts    # API endpoints
          ├─ payment.module.ts        # Module definition
          │
          └─ dto/
              └─ payment.dto.ts       # Request/response types
    
    src/config/
      └─ configuration.ts            # Razorpay config

  lireons-frontend/
    components/
      payments/
        │
        ├─ RazorpayPaymentForm.tsx   # Payment form
        ├─ PaymentStatusCard.tsx     # Status display
        │
        └─ hooks/
            └─ usePayment.ts         # Payment hook (optional)

docs/
  └─ RAZORPAY-INTEGRATION.md         # This guide
```

## Next Steps

1. ✅ Set up Razorpay account
2. ✅ Configure environment variables
3. ✅ Test payment flow locally
4. ⏳ Integrate into existing subscription flow
5. ⏳ Deploy to staging
6. ⏳ Test with real cards (staging)
7. ⏳ Deploy to production
8. ⏳ Switch to live mode
9. ⏳ Monitor payments and webhooks

---

For questions or issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs/)
