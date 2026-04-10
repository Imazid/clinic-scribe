import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
}

export function Card({ className, variant = 'default', interactive = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        variant === 'default' && 'bg-surface-container-lowest shadow-ambient-sm',
        variant === 'elevated' && 'bg-surface-container-lowest shadow-ambient',
        variant === 'outlined' && 'bg-surface-container-lowest border border-outline-variant',
        interactive && 'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-ambient cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-on-surface', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-on-surface-variant mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
