'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'action';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-primary/70 bg-primary text-on-primary shadow-ambient-sm hover:-translate-y-px hover:bg-primary-container hover:shadow-ambient active:translate-y-0',
  secondary:
    'border border-secondary/50 bg-secondary text-on-secondary shadow-ambient-sm hover:-translate-y-px hover:bg-secondary/90 hover:shadow-ambient active:translate-y-0',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary',
  ghost: 'text-on-surface-variant hover:bg-surface-container-high',
  danger:
    'border border-error/40 bg-error text-white shadow-ambient-sm hover:-translate-y-px hover:bg-error/90 hover:shadow-ambient active:translate-y-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
  action: 'px-4 py-2.5 text-sm rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-[transform,box-shadow,background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
