import { Suspense, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { UserAvatarMenu } from '@/components/auth/user-avatar-menu';
import { HeaderAuthEntry } from '@/components/auth/header-auth-entry';
import { HeaderSearchButton } from '@/components/layout/header-search-button';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { SiteFooter } from '@/components/layout/site-footer';
import { getCurrentUser } from '@/server/auth';
import { getServerLocale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const locale = await getServerLocale();
  const t = getMessages(locale);
  const isHallAdminOnly = user?.role === 'ADMIN';
  const isHallManager = user?.role === 'MANAGER';
  const canSeeOwnerManagerPanel = user?.role === 'OWNER';
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-transparent">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3">
          <div className="relative isolate flex items-center justify-between gap-3 overflow-visible rounded-2xl bg-surface/25 px-3 py-2.5 shadow-[0_8px_24px_rgba(28,28,28,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:px-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_42%,rgba(255,255,255,0.18)_100%)] shadow-[inset_0_10px_26px_rgba(255,255,255,0.16),inset_0_-10px_22px_rgba(255,255,255,0.12)]"
            />
            <Link
              href={ROUTES.home}
              className="group relative z-10 hidden shrink-0 items-center sm:inline-flex"
            >
              <span className="relative h-10 w-10">
                <Image
                  src="/logo-mark.png"
                  alt="Логотип TableFlow"
                  fill
                  sizes="40px"
                  priority
                  className="object-contain transition-opacity duration-200 group-hover:opacity-0"
                />
                <Image
                  src="/logo-mark-black.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="40px"
                  className="object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </span>
            </Link>
            <div className="relative z-10 ml-auto flex items-center gap-2 sm:gap-3">
              <Suspense fallback={<div className="hidden h-10 w-56 rounded-full border border-border/75 bg-surface md:block" />}>
                <HeaderSearchButton locale={locale} label={t.appShell.search} ariaLabel={t.appShell.searchAria} />
              </Suspense>
              <LanguageToggle locale={locale} ariaLabel={t.appShell.localeToggleAria} />
              <nav className="hidden items-center gap-2 md:flex">
                <Link
                  href={ROUTES.restaurants}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-border/75 bg-surface px-4 text-sm font-semibold text-foreground transition-all duration-200 ease-in-out hover:border-primary/35 hover:bg-primary hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="M7 4v6M9 4v6M11 4v6M9 10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M16 4v6c0 1.105-.895 2-2 2h0V4h2zM14 12v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {t.appShell.restaurants}
                </Link>
                {isHallAdminOnly ? (
                  <Link
                    href={ROUTES.adminDashboard}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-surface-soft hover:text-foreground"
                  >
                    {t.appShell.admin}
                  </Link>
                ) : null}
                {isHallManager ? (
                  <Link
                    href={ROUTES.adminDashboard}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-surface-soft hover:text-foreground"
                  >
                    {t.appShell.manager}
                  </Link>
                ) : null}
                {canSeeOwnerManagerPanel ? (
                  <Link
                    href={ROUTES.manager}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-surface-soft hover:text-foreground"
                  >
                    {t.appShell.manager}
                  </Link>
                ) : null}
              </nav>
              {user ? (
                <UserAvatarMenu user={user} myReservationsLabel={t.appShell.myReservations} myFavoritesLabel={t.appShell.myFavorites} />
              ) : (
                <HeaderAuthEntry locale={locale} />
              )}
            </div>
          </div>
          <div className="relative md:hidden">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            >
              <path
                d="M11 5a6 6 0 014.77 9.64l3.3 3.3a1 1 0 11-1.42 1.42l-3.3-3.3A6 6 0 1111 5z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <input
              type="search"
              placeholder={t.appShell.search}
              aria-label={t.appShell.searchAria}
              className="h-11 w-full rounded-xl border border-border bg-surface pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}

