import type { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { LogoutButton } from '@/components/auth/logout-button';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href={ROUTES.home} className="font-semibold">
            Multi-Restaurant Reservations
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4 text-sm text-slate-300">
              <Link href={ROUTES.restaurants} className="hover:text-white">
                Restaurants
              </Link>
              <Link href={ROUTES.myReservations} className="hover:text-white">
                My reservations
              </Link>
              <Link href={ROUTES.managerDashboard} className="hover:text-white">
                Manager
              </Link>
            </nav>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-950">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <footer className="border-t border-slate-800 bg-slate-900/80">
        <div className="container mx-auto px-4 py-3 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Diploma project
        </div>
      </footer>
    </div>
  );
}

