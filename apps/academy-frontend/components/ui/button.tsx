import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variantClass: Record<ButtonVariant, string> = {
    default: 'btn-primary',
    secondary: 'btn-secondary',
    outline:
      'inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] font-medium hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_8%,transparent)]',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-lg text-[var(--foreground)] font-medium hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_10%,transparent)]',
  };

  const sizeClass: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-base',
    icon: 'h-10 w-10',
  };

  return cn(
    'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60',
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export { Button };
