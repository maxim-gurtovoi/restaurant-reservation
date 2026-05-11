'use client';

import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export function RestaurantFavoriteHeart({
  restaurantId,
  initialFavorite,
  labels,
}: {
  restaurantId: string;
  /** When undefined, heart renders inactive until first interaction (avoid layout flash). */
  initialFavorite?: boolean;
  labels: { add: string; remove: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(Boolean(initialFavorite));
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const next = !active;
    setActive(next);
    try {
      if (next) {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId }),
        });
        if (res.status === 401) {
          setActive(false);
          router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`);
          return;
        }
        if (!res.ok) {
          setActive(!next);
        }
      } else {
        const res = await fetch(
          `/api/favorites?restaurantId=${encodeURIComponent(restaurantId)}`,
          { method: 'DELETE' },
        );
        if (res.status === 401) {
          setActive(next);
          router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`);
          return;
        }
        if (!res.ok) {
          setActive(!next);
        }
      }
      router.refresh();
    } catch {
      setActive(!next);
    } finally {
      setBusy(false);
    }
  }, [active, busy, restaurantId, router, pathname]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      disabled={busy}
      title={active ? labels.remove : labels.add}
      aria-label={active ? labels.remove : labels.add}
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/45',
        active && 'border-rose-400/70 bg-rose-500/25 text-rose-100',
      )}>
      <Heart
        className={cn('h-4 w-4', active ? 'fill-current' : 'opacity-90')}
        aria-hidden
      />
    </button>
  );
}
