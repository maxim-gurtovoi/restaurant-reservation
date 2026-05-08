'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function HeaderSearchButton({
  label,
  ariaLabel,
  className,
}: {
  label: string;
  ariaLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  const qFromURL = isHome ? (searchParams.get('q') ?? '') : '';
  const [value, setValue] = useState(qFromURL);
  const skipDebounce = useRef(false);

  // Keep input in sync with URL when navigating to home page from outside
  useEffect(() => {
    if (qFromURL !== value) {
      skipDebounce.current = true;
      setValue(qFromURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qFromURL]);

  // On home page: debounced URL update as the user types
  useEffect(() => {
    if (!isHome) return;
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set('q', value);
      else next.delete('q');
      router.replace(next.toString() ? `/?${next.toString()}` : '/');
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isHome]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isHome) {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set('q', value);
      else next.delete('q');
      router.replace(next.toString() ? `/?${next.toString()}` : '/');
    } else {
      router.push(value ? `/?q=${encodeURIComponent(value)}` : '/');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn('relative hidden md:inline-flex', className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground"
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
        aria-label={ariaLabel}
        className="h-10 w-56 rounded-full border border-border/75 bg-surface pl-10 pr-4 text-sm leading-10 text-foreground outline-none transition placeholder:text-xs placeholder:font-semibold placeholder:text-foreground/70 hover:placeholder:text-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
