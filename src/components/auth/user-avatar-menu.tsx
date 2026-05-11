'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JwtPayloadUser } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function UserAvatarMenu({
  user,
  myReservationsLabel,
  myFavoritesLabel,
}: {
  user: JwtPayloadUser;
  myReservationsLabel: string;
  myFavoritesLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const avatarLetter = useMemo(() => {
    const email = user.email ?? '';
    const firstChar = email.trim().slice(0, 1);
    return (firstChar || 'U').toUpperCase();
  }, [user.email]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (!root.contains(target)) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/auth/login');
      router.refresh();
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-9 w-9 cursor-pointer rounded-full p-0 transition-all duration-150 ease-in-out hover:scale-[1.03] hover:shadow-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-bg text-sm font-semibold text-accent-text">
          {avatarLetter}
        </span>
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border/55 bg-surface shadow-card-strong ring-1 ring-border/40"
        >
          <Link
            href={ROUTES.myReservations}
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm font-medium text-foreground transition-colors duration-150 ease-in-out hover:bg-surface-soft"
            onClick={() => setOpen(false)}
          >
            {myReservationsLabel}
          </Link>
          <Link
            href={ROUTES.myFavorites}
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm font-medium text-foreground transition-colors duration-150 ease-in-out hover:bg-surface-soft"
            onClick={() => setOpen(false)}
          >
            {myFavoritesLabel}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface-soft hover:font-semibold"
            onClick={() => setOpen(false)}
          >
            Профиль
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface-soft hover:font-semibold"
            onClick={() => setOpen(false)}
          >
            Настройки
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 ease-in-out hover:bg-surface-soft hover:font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onLogout}
          >
            {loggingOut ? 'Выход…' : 'Выйти'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

