import Link from 'next/link';
import { ArrowUpRight, MonitorPlay } from 'lucide-react';

type FooterProps = {
  serviceName: string;
  organizationName: string;
};

export default function Footer({ serviceName, organizationName }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)]">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <span className="inline-flex items-center justify-center rounded-lg h-9 w-9 border border-[var(--border)] surface-muted">
              <MonitorPlay className="w-5 h-5 brand-primary-text" />
            </span>
            <span className="font-bold text-xl">{serviceName}</span>
          </Link>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 max-w-md">
            {organizationName} learning portal with structured courses, curated articles, and guided lesson tracks.
          </p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-4">Learn</h4>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li><Link href="/" className="hover:text-[var(--brand-primary)]">Courses</Link></li>
            <li><Link href="/learn" className="hover:text-[var(--brand-primary)]">Video Lessons</Link></li>
            <li><Link href="/articles" className="hover:text-[var(--brand-primary)]">Articles</Link></li>
            <li><Link href="/problems" className="hover:text-[var(--brand-primary)]">Coding Problems</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-[0.16em] text-slate-500 mb-4">Account</h4>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li><Link href="/login" className="hover:text-[var(--brand-primary)]">Login</Link></li>
            <li><Link href="/signup" className="hover:text-[var(--brand-primary)]">Signup</Link></li>
            <li><Link href="/theme" className="hover:text-[var(--brand-primary)]">Theme Settings</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} {serviceName}. All rights reserved.</p>
        <p className="inline-flex items-center gap-1">
          {organizationName} <ArrowUpRight className="w-3.5 h-3.5" />
        </p>
      </div>
    </footer>
  );
}
