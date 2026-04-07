import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/55 bg-surface p-4 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  );
}
