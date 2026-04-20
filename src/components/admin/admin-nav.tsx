'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const items = [
  { href: ROUTES.adminDashboard, label: 'Обзор' },
  { href: ROUTES.adminReservations, label: 'Брони' },
  { href: ROUTES.adminFloorPlan, label: 'План зала' },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-border/55 bg-surface p-1 text-sm shadow-card-soft"
      aria-label="Панель администратора зала">
      {items.map(({ href, label }) => {
        const active =
          href === ROUTES.adminDashboard
            ? pathname === href
            : href === ROUTES.adminReservations
              ? pathname === href || pathname.startsWith(`${href}/`)
              : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:bg-surface-soft hover:text-foreground',
            )}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
