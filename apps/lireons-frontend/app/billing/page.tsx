'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import PaymentStatusCard from '@/components/payments/PaymentStatusCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Plan = {
  id: string;
  slug: string | null;
  name: string;
  billingCycle: string;
  price: string;
  maxStudentsAllowed: number;
  maxStorageGb: number;
  hasWhiteLabelApp: boolean;
  isActive: boolean;
  updatedAt: string;
};

type Invoice = {
  id: string;
  subId: string;
  ownerId: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  currency: string;
  status: string;
  pdfUrl: string | null;
  issuedAt: string;
  updatedAt: string;
  subscription?: {
    plan?: { name: string; billingCycle: string };
  };
  transaction?: {
    id: string;
    gateway: string;
    gatewayPaymentId: string | null;
    amountPaid: string;
    status: string;
    processedAt: string;
    updatedAt: string;
  } | null;
};

type Transaction = {
  id: string;
  invoiceId: string;
  gateway: string;
  gatewayPaymentId: string | null;
  amountPaid: string;
  status: string;
  processedAt: string;
  updatedAt: string;
};

export default function BillingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const backendToken = session?.backendToken || '';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [newPlan, setNewPlan] = useState({
    slug: '',
    name: '',
    billingCycle: 'MONTHLY',
    price: 0,
    maxStudentsAllowed: 100,
    maxStorageGb: 10,
    hasWhiteLabelApp: false,
    isActive: true,
  });

  const [newInvoice, setNewInvoice] = useState({
    subId: '',
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    currency: 'INR',
    status: 'DRAFT',
    pdfUrl: '',
    issuedAt: '',
  });

  const [newTransaction, setNewTransaction] = useState({
    invoiceId: '',
    gateway: 'RAZORPAY',
    gatewayPaymentId: '',
    amountPaid: 0,
    status: 'PENDING',
    processedAt: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${backendToken}`,
    }),
    [backendToken],
  );

  const loadData = async () => {
    if (!backendToken) return;

    setLoading(true);
    setError('');

    try {
      const [plansRes, invoicesRes, txRes] = await Promise.all([
        fetch(`${API_URL}/api/core-saas/billing/plans?includeInactive=true`, {
          headers,
        }),
        fetch(`${API_URL}/api/core-saas/billing/invoices`, { headers }),
        fetch(`${API_URL}/api/core-saas/billing/transactions`, { headers }),
      ]);

      if (!plansRes.ok || !invoicesRes.ok || !txRes.ok) {
        throw new Error('Failed to load billing data');
      }

      const plansData = (await plansRes.json()) as Plan[];
      const invoicesData = (await invoicesRes.json()) as Invoice[];
      const txData = (await txRes.json()) as Transaction[];

      setPlans(plansData);
      setInvoices(invoicesData);
      setTransactions(txData);

      if (!activeInvoiceId && invoicesData.length > 0) {
        setActiveInvoiceId(invoicesData[0].id);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load billing data',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [backendToken]);

  const submitPlan = async () => {
    try {
      setError('');
      setSuccess('');

      const payload = {
        ...newPlan,
        slug: newPlan.slug.trim() || undefined,
      };

      const response = await fetch(`${API_URL}/api/core-saas/billing/plans`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to create SaaS plan');
      }

      setSuccess('Plan created successfully');
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create plan',
      );
    }
  };

  const submitInvoice = async () => {
    try {
      setError('');
      setSuccess('');

      const payload = {
        ...newInvoice,
        pdfUrl: newInvoice.pdfUrl.trim() || undefined,
        issuedAt: newInvoice.issuedAt ? new Date(newInvoice.issuedAt).toISOString() : undefined,
      };

      const response = await fetch(`${API_URL}/api/core-saas/billing/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to create invoice');
      }

      setSuccess('Invoice created successfully');
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create invoice',
      );
    }
  };

  const submitTransaction = async () => {
    try {
      setError('');
      setSuccess('');

      const payload = {
        ...newTransaction,
        gatewayPaymentId: newTransaction.gatewayPaymentId.trim() || undefined,
        processedAt: newTransaction.processedAt
          ? new Date(newTransaction.processedAt).toISOString()
          : undefined,
      };

      const response = await fetch(`${API_URL}/api/core-saas/billing/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to create transaction');
      }

      setSuccess('Transaction created successfully');
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create transaction',
      );
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-700">
        Loading billing workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing Workspace</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage SaaS plans, invoices, and payment transactions using your schema columns.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Create SaaS Plan</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Plan name"
                value={newPlan.name}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Slug"
                value={newPlan.slug}
                onChange={(e) => setNewPlan((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={newPlan.billingCycle}
                onChange={(e) =>
                  setNewPlan((prev) => ({ ...prev, billingCycle: e.target.value }))
                }
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
              </select>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                step="0.01"
                placeholder="Price"
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                placeholder="Max students"
                value={newPlan.maxStudentsAllowed}
                onChange={(e) =>
                  setNewPlan((prev) => ({
                    ...prev,
                    maxStudentsAllowed: Number(e.target.value),
                  }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                placeholder="Max storage (GB)"
                value={newPlan.maxStorageGb}
                onChange={(e) =>
                  setNewPlan((prev) => ({ ...prev, maxStorageGb: Number(e.target.value) }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setNewPlan((prev) => ({ ...prev, hasWhiteLabelApp: !prev.hasWhiteLabelApp }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                White-label app: {newPlan.hasWhiteLabelApp ? 'YES' : 'NO'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewPlan((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Active: {newPlan.isActive ? 'YES' : 'NO'}
              </button>
              <button
                type="button"
                onClick={submitPlan}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-white"
              >
                Save Plan
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Create Invoice</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Subscription ID (subId)"
                value={newInvoice.subId}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, subId: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                step="0.01"
                placeholder="Subtotal"
                value={newInvoice.subtotal}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, subtotal: Number(e.target.value) }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                step="0.01"
                placeholder="Tax amount"
                value={newInvoice.taxAmount}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, taxAmount: Number(e.target.value) }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                step="0.01"
                placeholder="Total"
                value={newInvoice.total}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, total: Number(e.target.value) }))
                }
              />
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={newInvoice.status}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="DRAFT">DRAFT</option>
                <option value="OPEN">OPEN</option>
                <option value="PAST_DUE">PAST_DUE</option>
                <option value="PAID">PAID</option>
              </select>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="PDF URL"
                value={newInvoice.pdfUrl}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, pdfUrl: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="datetime-local"
                value={newInvoice.issuedAt}
                onChange={(e) =>
                  setNewInvoice((prev) => ({ ...prev, issuedAt: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={submitInvoice}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-white"
              >
                Save Invoice
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Create Transaction</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Invoice ID"
                value={newTransaction.invoiceId}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, invoiceId: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Gateway"
                value={newTransaction.gateway}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, gateway: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="Gateway Payment ID"
                value={newTransaction.gatewayPaymentId}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, gatewayPaymentId: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="number"
                step="0.01"
                placeholder="Amount paid"
                value={newTransaction.amountPaid}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, amountPaid: Number(e.target.value) }))
                }
              />
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={newTransaction.status}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                type="datetime-local"
                value={newTransaction.processedAt}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, processedAt: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={submitTransaction}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-white"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">SaaS Plans</h2>
            <div className="mt-4 max-h-105 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Slug</th>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Cycle</th>
                    <th className="px-2 py-2">Price</th>
                    <th className="px-2 py-2">Students</th>
                    <th className="px-2 py-2">Storage</th>
                    <th className="px-2 py-2">White label</th>
                    <th className="px-2 py-2">Active</th>
                    <th className="px-2 py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-t border-slate-100">
                      <td className="px-2 py-2">{plan.id.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{plan.slug || '-'}</td>
                      <td className="px-2 py-2">{plan.name}</td>
                      <td className="px-2 py-2">{plan.billingCycle}</td>
                      <td className="px-2 py-2">{plan.price}</td>
                      <td className="px-2 py-2">{plan.maxStudentsAllowed}</td>
                      <td className="px-2 py-2">{plan.maxStorageGb} GB</td>
                      <td className="px-2 py-2">{plan.hasWhiteLabelApp ? 'YES' : 'NO'}</td>
                      <td className="px-2 py-2">{plan.isActive ? 'YES' : 'NO'}</td>
                      <td className="px-2 py-2">{new Date(plan.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Invoices</h2>
            <div className="mt-4 max-h-105 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-2 py-2">Invoice ID</th>
                    <th className="px-2 py-2">Sub ID</th>
                    <th className="px-2 py-2">Owner ID</th>
                    <th className="px-2 py-2">Subtotal</th>
                    <th className="px-2 py-2">Tax</th>
                    <th className="px-2 py-2">Total</th>
                    <th className="px-2 py-2">Currency</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">PDF</th>
                    <th className="px-2 py-2">Issued</th>
                    <th className="px-2 py-2">Updated</th>
                    <th className="px-2 py-2">Tx ID</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => setActiveInvoiceId(invoice.id)}
                    >
                      <td className="px-2 py-2">{invoice.id.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{invoice.subId.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{invoice.ownerId.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{invoice.subtotal}</td>
                      <td className="px-2 py-2">{invoice.taxAmount}</td>
                      <td className="px-2 py-2">{invoice.total}</td>
                      <td className="px-2 py-2">{invoice.currency}</td>
                      <td className="px-2 py-2">{invoice.status}</td>
                      <td className="px-2 py-2">{invoice.pdfUrl || '-'}</td>
                      <td className="px-2 py-2">{new Date(invoice.issuedAt).toLocaleString()}</td>
                      <td className="px-2 py-2">{new Date(invoice.updatedAt).toLocaleString()}</td>
                      <td className="px-2 py-2">{invoice.transaction?.id?.slice(0, 8) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <div className="mt-4 max-h-105 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-2 py-2">Transaction ID</th>
                    <th className="px-2 py-2">Invoice ID</th>
                    <th className="px-2 py-2">Gateway</th>
                    <th className="px-2 py-2">Gateway Payment ID</th>
                    <th className="px-2 py-2">Amount Paid</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Processed At</th>
                    <th className="px-2 py-2">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-2 py-2">{tx.id.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{tx.invoiceId.slice(0, 8)}...</td>
                      <td className="px-2 py-2">{tx.gateway}</td>
                      <td className="px-2 py-2">{tx.gatewayPaymentId || '-'}</td>
                      <td className="px-2 py-2">{tx.amountPaid}</td>
                      <td className="px-2 py-2">{tx.status}</td>
                      <td className="px-2 py-2">{new Date(tx.processedAt).toLocaleString()}</td>
                      <td className="px-2 py-2">{new Date(tx.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Pay Invoice</h2>
            {activeInvoiceId ? (
              <div className="mt-4">
                <PaymentStatusCard
                  invoiceId={activeInvoiceId}
                  backendToken={backendToken}
                  apiBaseUrl={API_URL}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Select an invoice from the table to start payment.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
