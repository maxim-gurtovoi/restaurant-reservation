import type { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { UserAvatarMenu } from '@/components/auth/user-avatar-menu';
import { getCurrentUser } from '@/server/auth';

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const canSeeManager = user?.role === 'MANAGER';
  const canSeeAdmin = user?.role === 'ADMIN';
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/70 bg-surface/95 shadow-[0_1px_12px_rgba(28,28,28,0.06)] backdrop-blur-sm supports-backdrop-filter:bg-surface/90">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            href={ROUTES.home}
            className="inline-flex shrink-0 items-center gap-2 text-xl font-semibold text-primary"
          >
            <img
              src="/fork-and-knife.svg"
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
            <span>TableFlow</span>
          </Link>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <Link
                href={ROUTES.restaurants}
                className="cursor-pointer font-medium transition-colors duration-200 ease-in-out hover:text-foreground hover:font-semibold"
              >
                Restaurants
              </Link>
              {user ? (
                <Link
                  href={ROUTES.myReservations}
                  className="cursor-pointer font-medium transition-colors duration-200 ease-in-out hover:text-foreground hover:font-semibold"
                >
                  My reservations
                </Link>
              ) : null}
              {canSeeManager ? (
                <Link
                  href={ROUTES.managerDashboard}
                  className="cursor-pointer font-medium transition-colors duration-200 ease-in-out hover:text-foreground hover:font-semibold"
                >
                  Manager
                </Link>
              ) : null}
              {canSeeAdmin ? (
                <Link
                  href={ROUTES.admin}
                  className="cursor-pointer font-medium transition-colors duration-200 ease-in-out hover:text-foreground hover:font-semibold"
                >
                  Admin
                </Link>
              ) : null}
            </nav>
            {user ? (
              <UserAvatarMenu user={user} />
            ) : (
              <div className="flex items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={ROUTES.login}>Sign in</Link>
                </Button>
                <Button asChild variant="primary">
                  <Link href={ROUTES.register}>Create account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-3 text-xs text-muted">
          &copy; {new Date().getFullYear()} TableFlow
        </div>
      </footer>
    </div>
  );
}

