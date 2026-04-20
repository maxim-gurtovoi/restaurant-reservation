import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { requireAdmin } from '@/server/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Console
        </h1>
        <AdminNav />
      </header>
      <main>{children}</main>
    </div>
  );
}
