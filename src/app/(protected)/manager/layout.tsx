import type { ReactNode } from 'react';
import { StaffSegmentNav } from '@/components/staff/staff-segment-nav';
import { requireManagerShell } from '@/server/auth';

/**
 * MANAGER: same segment control as in /admin (Обзор, Брони, Панель, План зала).
 * OWNER: platform panel without this sub-nav (no /admin access).
 */
export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireManagerShell();

  if (user.role !== 'MANAGER') {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      <header className="flex w-full justify-end">
        <StaffSegmentNav role="MANAGER" />
      </header>
      {children}
    </div>
  );
}
