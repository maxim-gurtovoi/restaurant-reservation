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
    'bg-primary text-white shadow-[0_2px_6px_rgba(123,47,155,0.25),0_8px_20px_rgba(123,47,155,0.15)] hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none',
  outline:
    'border border-border-strong/65 bg-surface text-foreground hover:border-accent-border hover:bg-accent-bg/35 hover:text-accent-text',
  ghost: 'text-foreground hover:bg-surface-soft',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant = 'primary', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed',
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
