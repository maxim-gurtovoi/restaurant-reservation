import type { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { LogoutButton } from '@/components/auth/logout-button';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 text-xl font-semibold text-[#107c41]"
          >
            <img
              src="/fork-and-knife.svg"
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
            <span>Reservations</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-5 text-sm text-gray-600">
              <Link href={ROUTES.restaurants} className="hover:text-gray-900">
                Restaurants
              </Link>
              <Link href={ROUTES.myReservations} className="hover:text-gray-900">
                My reservations
              </Link>
              <Link href={ROUTES.managerDashboard} className="hover:text-gray-900">
                Manager
              </Link>
            </nav>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-3 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Diploma project
        </div>
      </footer>
    </div>
  );
}

