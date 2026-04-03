import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

function badgeVariantClass(variant: BadgeVariant): string {
  switch (variant) {
    case 'secondary':
      return 'bg-[color:color-mix(in_srgb,var(--surface-muted)_94%,transparent)] text-slate-700 dark:text-slate-300 border border-[var(--border)]';
    case 'outline':
      return 'bg-transparent text-slate-700 dark:text-slate-300 border border-[var(--border)]';
    default:
      return 'bg-[color:color-mix(in_srgb,var(--brand-primary)_10%,var(--surface))] text-[color:color-mix(in_srgb,var(--brand-primary)_76%,#0f172a)] border border-[color:color-mix(in_srgb,var(--brand-primary)_26%,var(--border))]';
  }
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        badgeVariantClass(variant),
        className,
      )}
      {...props}
    />
  );
}
