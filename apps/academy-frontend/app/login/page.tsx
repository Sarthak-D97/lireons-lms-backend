'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ACADEMY_API_URL } from '@/lib/public-config';

type LoginResponse = {
  success?: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    orgId: string | null;
  };
  error?: {
    message?: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${ACADEMY_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.error?.message ?? 'Login failed');
      }

      localStorage.setItem(
        'academy_session',
        JSON.stringify({
          token: data.token,
          user: data.user,
          savedAt: new Date().toISOString(),
        }),
      );

      router.push('/learn');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to login');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell container mx-auto px-4 py-14 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <aside className="surface-card p-7 md:p-8">
          <p className="chip mb-4">Welcome Back</p>
          <h1 className="text-3xl font-bold mb-3">Log in to continue learning</h1>
          <p className="text-slate-600 dark:text-slate-400 leading-8 text-sm">
            Access your lessons, progress timeline, and enrolled course materials.
          </p>
        </aside>

        <div className="surface-card p-7 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-input"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 disabled:opacity-70">
              {isSubmitting ? 'Signing in...' : 'Log In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="link-brand">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
