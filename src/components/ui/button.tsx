'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-emerald-800',
  outline:
    'border border-slate-700 bg-transparent text-slate-50 hover:bg-slate-900',
  ghost: 'text-slate-200 hover:bg-slate-900',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant = 'primary', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed',
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

