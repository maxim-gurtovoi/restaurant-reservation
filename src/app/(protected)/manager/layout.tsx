import type { ReactNode } from 'react';
import { ManagerNav } from '@/components/manager/manager-nav';
import { requireManager } from '@/server/auth';

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireManager();
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manager Console
        </h1>
        <ManagerNav />
      </header>
      <main>{children}</main>
    </div>
  );
}

