# Razorpay Integration - Quick Start

## ✅ What Was Implemented

### Backend (NestJS - apps/lireons-main)

1. **Razorpay Service** `src/core-saas/payment/razorpay.service.ts`
   - Order creation
   - Payment fetching
   - Payment capture & refunds
   - Signature verification (payment + webhook)

2. **SaaS Payment Service** `src/core-saas/payment/saas-payment.service.ts`
   - Invoice payment initiation
   - Payment callback handling
   - Payment status tracking
   - Invoice & subscription updates

3. **Payment Controller** `src/core-saas/payment/payment.controller.ts`
   - `POST /core-saas/payments/initiate` - Start payment
   - `POST /core-saas/payments/callback` - Verify payment
   - `GET /core-saas/payments/status/:invoiceId` - Check status
   - `POST /core-saas/payments/webhook` - Razorpay webhooks

4. **Payment Module** `src/core-saas/payment/payment.module.ts`
   - Registered in CoreSaasModule

5. **Configuration** `src/config/configuration.ts`
   - Razorpay credentials support

### Frontend (Next.js - apps/lireons-frontend)

1. **Payment Form Component** `components/payments/RazorpayPaymentForm.tsx`
   - Loads Razorpay checkout
   - Handles payment submission
   - Verifies payment with backend
   - Error handling

2. **Payment Status Card** `components/payments/PaymentStatusCard.tsx`
   - Displays payment status
   - Shows amount due
   - Renders payment form
   - Success/failure feedback

### Documentation

1. **Full Integration Guide** - `docs/RAZORPAY-INTEGRATION.md`
   - Environment variables
   - API endpoints
   - Testing instructions
   - Security considerations

2. **Implementation Guide** - `docs/RAZORPAY-IMPLEMENTATION-GUIDE.md`
   - Architecture diagrams
   - Step-by-step integration
   - Payment flow explanation
   - Troubleshooting

3. **Environment Template** - `.env.razorpay.example`
   - Copy to `.env.local` files

---

## 🚀 Next Steps (Required)

### 1. Get Razorpay Credentials

Go to [https://razorpay.com](https://razorpay.com):
- Sign up/login
- Settings → API Keys
- Copy **Key ID** and **Key Secret**
- Settings → Webhooks
- Create webhook at `http://your-api-url/core-saas/payments/webhook`
- Copy **Webhook Secret**

### 2. Configure Environment Variables

**Backend** (`apps/lireons-main/.env.local`):
```bash
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Frontend** (`apps/lireons-frontend/.env.local`):
```bash
NEXT_PUBLIC_RAZORPAY_KEY=your_key_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. Update Subscription Flow Integration

Find where subscriptions are created and add payment step:

In your subscription flow (e.g., plan selection page):

```tsx
import PaymentStatusCard from '@/components/payments/PaymentStatusCard';

export default function SubscriptionCheckout() {
  return (
    <PaymentStatusCard 
      invoiceId={invoiceId}  // From subscription creation response
      initialStatus="pending"
    />
  );
}
```

### 4. Start Development Server

```bash
cd apps/lireons-main
pnpm run start:dev

# In another terminal:
cd apps/lireons-frontend
pnpm run dev
```

Visit: http://localhost:3000

### 5. Test Payment Flow

Use Razorpay test cards:
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4222 2222 2222 2222`
- Any future expiry, any CVC

---

## 📋 Key Files

| File | Purpose |
|------|---------|
| [src/core-saas/payment/razorpay.service.ts](../../apps/lireons-main/src/core-saas/payment/razorpay.service.ts) | Razorpay API wrapper |
| [src/core-saas/payment/saas-payment.service.ts](../../apps/lireons-main/src/core-saas/payment/saas-payment.service.ts) | Payment business logic |
| [src/core-saas/payment/payment.controller.ts](../../apps/lireons-main/src/core-saas/payment/payment.controller.ts) | API endpoints |
| [components/payments/RazorpayPaymentForm.tsx](../../apps/lireons-frontend/components/payments/RazorpayPaymentForm.tsx) | Frontend payment form |
| [components/payments/PaymentStatusCard.tsx](../../apps/lireons-frontend/components/payments/PaymentStatusCard.tsx) | Payment status UI |

---

## 🔄 Payment Flow

```
1. User selects SaaS plan
   ↓
2. Backend creates subscription + invoice
   ↓
3. Frontend displays PaymentStatusCard
   ↓
4. User clicks "Pay"
   ↓
5. Backend: POST /initiate creates Razorpay order
   ↓
6. Frontend: Opens Razorpay checkout
   ↓
7. User enters card details
   ↓
8. Frontend: POST /callback verifies payment signature
   ↓
9. Backend: Updates invoice status to PAID
   ↓
10. Frontend: Shows success message
   ↓
11. Subscription activated
```

---

## 🛠️ Troubleshooting

**Payment form not opening?**
- Check `NEXT_PUBLIC_RAZORPAY_KEY` is set
- Verify Razorpay script loaded: Open DevTools → Network tab

**Callback not working?**
- Verify backend is running on `http://localhost:4000`
- Check `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard
- Enable logging in `payment.controller.ts`

**Invoice not found?**
- Verify invoiceId from subscription creation
- Check invoice belongs to correct owner

**Signature verification failed?**
- Double-check webhook secret (copy-paste carefully)
- Ensure webhook is receiving calls from Razorpay

---

## 📚 Additional Resources

- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Full Integration Guide](RAZORPAY-INTEGRATION.md)
- [Implementation Guide](RAZORPAY-IMPLEMENTATION-GUIDE.md)

---

## ✨ Features Included

✅ Order creation
✅ Payment verification
✅ Webhook handling  
✅ Signature verification
✅ Error handling
✅ Type-safe implementation
✅ Modular architecture
✅ Component-based UI
✅ Full documentation
✅ Test mode support

---

## 🔒 Security

All sensitive data is encrypted:
- API keys stored in `.env.local`
- Webhook signatures verified
- Payment callbacks authenticated
- User authorization on all endpoints

---

## 📞 Support

For Razorpay issues: [support.razorpay.com](https://support.razorpay.com)

For NestJS issues: [docs.nestjs.com](https://docs.nestjs.com)

For Next.js issues: [nextjs.org/docs](https://nextjs.org/docs)
