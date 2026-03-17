'use client';

import React, { useEffect, useState } from 'react';
import RazorpayPaymentForm from './RazorpayPaymentForm';

interface PaymentStatusProps {
  invoiceId: string;
  backendToken: string;
  apiBaseUrl?: string;
  initialStatus?: string;
}

export const PaymentStatusCard: React.FC<PaymentStatusProps> = ({
  invoiceId,
  backendToken,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  initialStatus = 'PENDING',
}) => {
  const [paymentStatus, setPaymentStatus] = useState(initialStatus);
  const [amount, setAmount] = useState<number>(1000); // Default amount for testing
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!backendToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/core-saas/payments/status/${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${backendToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentStatus(data.payment?.status || data.status || 'PENDING');
          setAmount(Number(data.total) || 1000);
          setCurrency(data.currency || 'INR');
          setError(null);
        } else {
          // If API fails, still show form with default amount
          setError(`Could not load invoice (${response.status})`);
          setPaymentStatus('PENDING');
          setAmount(1000);
        }
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
        setError('Failed to load invoice details. Payment form is still available.');
        setPaymentStatus('PENDING');
        setAmount(1000);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [apiBaseUrl, backendToken, invoiceId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        Loading payment status...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Payment Status</h3>
        <p className="text-sm text-slate-500">Invoice: {invoiceId}</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Amount Due</span>
          <span className="text-lg font-bold">
            {currency} {amount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Status</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              paymentStatus === 'SUCCESS'
                ? 'bg-green-100 text-green-800'
                : paymentStatus === 'PAID'
                  ? 'bg-green-100 text-green-800'
                : paymentStatus === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {paymentStatus}
          </span>
        </div>

        {paymentStatus !== 'SUCCESS' && paymentStatus !== 'PAID' && (
          <RazorpayPaymentForm
            invoiceId={invoiceId}
            amount={amount}
            currency={currency}
            backendToken={backendToken}
            apiBaseUrl={apiBaseUrl}
            onSuccess={() => {
              setPaymentStatus('SUCCESS');
            }}
            onError={(err) => {
              console.error('Payment error:', err);
              setError('Payment failed. Please try again.');
            }}
          />
        )}

        {(paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">✓ Payment Successful</p>
            <p className="text-sm text-green-700 mt-1">
              Your payment has been processed successfully. Your subscription is now active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusCard;
