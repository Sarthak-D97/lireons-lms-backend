# Razorpay Integration Setup Guide

## Environment Variables

### Backend (.env.local or .env)

Add the following environment variables to your backend `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Backend URL (for webhooks)
BACKEND_URL=http://localhost:4000
```

### Frontend (.env.local)

Add the following environment variables to your frontend `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Getting Razorpay Credentials

1. **Sign up on Razorpay**: Visit [https://razorpay.com](https://razorpay.com) and create an account
2. **Get API Keys**:
   - Go to Settings → API Keys
   - Copy your Key ID and Key Secret
   - Keep these secure and never commit them to version control

3. **Webhook Secret**:
   - Go to Settings → Webhooks
   - Create a new webhook endpoint: `http://your-backend-url/core-saas/payments/webhook`
   - Copy the Webhook Secret

## Razorpay Webhook Setup

1. In Razorpay Dashboard:
   - Go to Settings → Webhooks
   - Click "Create New Webhook"
   - **Webhook URL**: `https://your-domain.com/core-saas/payments/webhook`
   - **Select Events**:
     - `payment.authorized`
     - `payment.failed`
     - `order.paid`

2. Save the webhook secret provided

## API Endpoints

### 1. Initiate Payment

**POST** `/core-saas/payments/initiate`

```json
{
  "invoiceId": "invoice-uuid"
}
```

**Response**:
```json
{
  "orderId": "razorpay-order-id",
  "amount": 999.99,
  "currency": "INR",
  "invoiceId": "invoice-uuid"
}
```

### 2. Payment Callback

**POST** `/core-saas/payments/callback`

```json
{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

### 3. Get Payment Status

**GET** `/core-saas/payments/status/:invoiceId`

**Response**:
```json
{
  "invoiceId": "invoice-uuid",
  "status": "PAID",
  "amount": 999.99,
  "currency": "INR",
  "paymentStatus": "SUCCESS",
  "transactionId": "transaction-uuid"
}
```

### 4. Webhook Handler

**POST** `/core-saas/payments/webhook`

Receives events from Razorpay:
- `payment.authorized`
- `payment.failed`
- `order.paid`

## Frontend Integration

### Using the Payment Component

```tsx
import RazorpayPaymentForm from '@/components/payments/RazorpayPaymentForm';

export default function PaymentPage() {
  return (
    <RazorpayPaymentForm
      invoiceId="your-invoice-id"
      amount={999.99}
      currency="INR"
      onSuccess={(response) => {
        console.log('Payment successful:', response);
        // Handle success
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle error
      }}
    />
  );
}
```

### Using the Payment Status Card

```tsx
import PaymentStatusCard from '@/components/payments/PaymentStatusCard';

export default function InvoicePage() {
  return (
    <PaymentStatusCard 
      invoiceId="your-invoice-id"
      initialStatus="pending"
    />
  );
}
```

## Testing

### Test Card Numbers

Razorpay provides test cards for development:

- **Success**: 4111 1111 1111 1111
  - Any future expiry date
  - Any CVC

- **Failure**: 4222 2222 2222 2222
  - Any future expiry date
  - Any CVC

### Test Webhook

Use Razorpay's webhook testing tool in the dashboard or curl:

```bash
curl -X POST http://localhost:4000/core-saas/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: your-webhook-signature" \
  -d '{"event":"payment.authorized","payload":{"payment":{"entity":{"id":"pay_test"}}}}'
```

## Database Schema

The following models are used for payment tracking:

### Invoice
- `id`: Unique invoice ID
- `subId`: Subscription ID
- `ownerId`: Tenant owner ID
- `subtotal`: Subtotal amount
- `taxAmount`: Tax amount
- `total`: Total amount
- `currency`: Currency (default: INR)
- `status`: DRAFT | OPEN | PAID
- `transaction`: Reference to payment transaction

### SaasPaymentTransaction
- `id`: Unique transaction ID
- `invoiceId`: Reference to invoice
- `gateway`: Payment gateway (RAZORPAY or STRIPE)
- `gatewayPaymentId`: Razorpay payment/order ID
- `amountPaid`: Amount paid in paise
- `status`: PENDING | SUCCESS | FAILED
- `processedAt`: Timestamp of processing

## Error Handling

Common errors and solutions:

1. **Invalid Signature**: Verify webhook secret is correct
2. **Invoice Not Found**: Check invoiceId is correct and belongs to the user
3. **Amount Mismatch**: Verify amount calculations (Razorpay uses paise)
4. **Payment Already Paid**: Invoice already has a successful payment

## Security Considerations

1. **Signature Verification**: All callbacks are verified using webhook secret
2. **User Authorization**: Only invoice owners can initiate/callback payments
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Keep API keys in `.env` files, never in code
5. **Rate Limiting**: Consider implementing rate limiting on payment endpoints

## Troubleshooting

### Payment initialization fails
- Check Razorpay credentials in `.env`
- Verify invoice exists and belongs to the user
- Check network connectivity to Razorpay API

### Webhook not received
- Verify webhook URL is publicly accessible
- Check webhook secret in Razorpay dashboard
- Review webhook logs in Razorpay dashboard

### Payment verification fails
- Ensure signature verification code matches Razorpay documentation
- Check webhook signature secret is correctly configured

## Support

For Razorpay support: [https://support.razorpay.com](https://support.razorpay.com)

For integration issues, check:
1. Razorpay API documentation: [https://razorpay.com/docs/](https://razorpay.com/docs/)
2. Backend logs for error messages
3. Razorpay dashboard webhook logs
