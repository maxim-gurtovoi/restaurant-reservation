'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type StaffSegmentRole = 'ADMIN' | 'MANAGER';

type StaffSegmentNavProps = {
  role: StaffSegmentRole;
};

const ADMIN_ITEMS = [
  { href: ROUTES.adminDashboard, label: 'Обзор' },
  { href: ROUTES.adminReservations, label: 'Брони' },
] as const;

const MANAGER_EXTRA = [
  { href: ROUTES.manager, label: 'Панель управляющего' },
  { href: ROUTES.managerFloorPlan, label: 'План зала' },
] as const;

function isSegmentActive(pathname: string, href: string): boolean {
  if (href === ROUTES.adminDashboard) {
    return pathname === href;
  }
  if (href === ROUTES.adminReservations) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === ROUTES.manager) {
    return pathname === href;
  }
  if (href === ROUTES.managerFloorPlan) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

export function StaffSegmentNav({ role }: StaffSegmentNavProps) {
  const pathname = usePathname();
  const items =
    role === 'MANAGER' ? [...ADMIN_ITEMS, ...MANAGER_EXTRA] : [...ADMIN_ITEMS];

  return (
    <nav
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border/55 bg-surface p-1 text-sm shadow-card-soft"
      aria-label={
        role === 'MANAGER'
          ? 'Навигация панели управляющего'
          : 'Навигация администратора зала'
      }>
      {items.map(({ href, label }) => {
        const active = isSegmentActive(pathname, href);
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
