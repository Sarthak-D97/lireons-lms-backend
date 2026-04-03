'use client';

import { MonitorPlay, Moon, Sparkles, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

type NavbarProps = {
  serviceName: string;
  organizationName: string;
  logoUrl?: string | null;
};

export default function Navbar({
  serviceName,
  organizationName,
  logoUrl,
}: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_90%,transparent)]/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center rounded-lg h-8 w-8 border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_92%,transparent)]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={serviceName}
                className="h-7 w-7 rounded object-cover"
              />
            ) : (
              <MonitorPlay className="w-4.5 h-4.5 brand-primary-text" />
            )}
          </span>
          <span className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {serviceName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5 font-medium text-sm text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-[var(--brand-primary)] transition-colors">
            Courses
          </Link>
          <Link href="/learn" className="hover:text-[var(--brand-primary)] transition-colors">
            Videos
          </Link>
          <Link href="/articles" className="hover:text-[var(--brand-primary)] transition-colors">
            Articles
          </Link>
          <Link href="/problems" className="hover:text-[var(--brand-primary)] transition-colors">
            Problems
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle theme"
            type="button"
          >
            <Sun className="hidden h-4.5 w-4.5 dark:block" />
            <Moon className="h-4.5 w-4.5 dark:hidden" />
          </button>
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-[var(--brand-primary)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-primary px-3.5 sm:px-4 py-2 text-sm"
            title={`Create account for ${organizationName}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Join
          </Link>
        </div>
      </div>
    </nav>
  );
}
