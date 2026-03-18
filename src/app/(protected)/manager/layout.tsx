import type { ReactNode } from 'react';
import { requireManager } from '@/server/auth';

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireManager();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manager Console
        </h1>
        {/* TODO: add manager nav */}
      </header>
      <main>{children}</main>
    </div>
  );
}

