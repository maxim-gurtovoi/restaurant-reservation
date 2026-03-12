import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  return <div className="container mx-auto px-4 py-8">{children}</div>;
}

