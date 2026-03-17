'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface RazorpayPaymentFormProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  backendToken: string;
  apiBaseUrl?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const RazorpayPaymentForm: React.FC<RazorpayPaymentFormProps> = ({
  invoiceId,
  amount,
  currency = 'INR',
  backendToken,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      console.log('🔍 Payment button clicked', { invoiceId, amount, currency, hasToken: !!backendToken });
      setLoading(true);
      setError(null);

      if (!backendToken) {
        throw new Error('Missing backend token. Please sign in again.');
      }

      console.log('📡 Initiating payment with backend...');
      const response = await fetch(`${apiBaseUrl}/api/core-saas/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          invoiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const paymentData = await response.json();
      console.log('✅ Payment initiated, loading Razorpay...');

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(
            'script[data-razorpay-checkout]'
          ) as HTMLScriptElement | null;

          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')), {
              once: true,
            });
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.dataset.razorpayCheckout = 'true';
          script.onload = () => {
            console.log('✅ Razorpay script loaded');
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round(amount * 100),
        currency,
        order_id: paymentData.orderId,
        name: 'Lireons',
        description: `Invoice payment - ${invoiceId}`,
        handler: async (response: any) => {
          try {
            console.log('💳 Payment received from Razorpay, verifying signature...');
            const verifyResponse = await fetch(
              `${apiBaseUrl}/api/core-saas/payments/callback`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${backendToken}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();
            console.log('✅ Payment verified successfully');
            onSuccess?.(result);
          } catch (err) {
            console.error('❌ Payment verification error:', err);
            setError(
              err instanceof Error ? err.message : 'Payment verification failed',
            );
            onError?.(err);
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ Razorpay modal dismissed');
            setLoading(false);
          },
        },
      };

      interface RazorpayCheckout {
        open(): void;
      }

      console.log('🎯 Opening Razorpay checkout...');
      const razorpayInstance: RazorpayCheckout = new (window as any).Razorpay(
        options,
      );
      razorpayInstance.open();
    } catch (err) {
      console.error('❌ Payment initiation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Primary button using UI component */}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Processing...' : `Pay ${currency} ${amount}`}
      </Button>

      {/* Fallback plain HTML button for debugging */}
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '⏳ Processing...' : `💳 Quick Pay ${currency} ${amount}`}
      </button>
    </div>
  );
};

export default RazorpayPaymentForm;
