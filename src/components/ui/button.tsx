'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Variant =
  | 'primary'
  | 'hero'
  | 'outline'
  | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active disabled:opacity-50',
  hero:
    'bg-gradient-to-r from-primary via-hero-via to-hero-to text-white hover:brightness-105 active:brightness-95',
  outline:
    'border border-border-strong/65 bg-surface text-foreground hover:border-accent-border hover:bg-accent-bg/35 hover:text-accent-text',
  ghost: 'text-foreground hover:bg-surface-soft',
};

const sizeClasses: Record<Size, string> = {
  sm: 'rounded-md px-3 py-2 text-xs',
  md: 'rounded-xl px-4 py-2.5 text-sm',
  lg: 'rounded-xl px-5 py-3 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant = 'primary', size = 'md', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center font-medium transition-[color,background-color,box-shadow,transform,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
