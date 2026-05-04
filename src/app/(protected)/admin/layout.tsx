import type { ReactNode } from 'react';
import { StaffSegmentNav } from '@/components/staff/staff-segment-nav';
import { requireAdmin } from '@/server/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();
  const segmentRole = user.role === 'MANAGER' ? 'MANAGER' : 'ADMIN';
  const title = segmentRole === 'MANAGER' ? 'Панель управляющего' : 'Администратор';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <StaffSegmentNav role={segmentRole} />
      </header>
      <main>{children}</main>
    </div>
  );
}
