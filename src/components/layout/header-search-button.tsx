'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { cn } from '@/lib/utils';

type SuggestRow = { slug: string; name: string; cuisine: string | null };

const SUGGEST_DEBOUNCE_MS = 280;

export function HeaderSearchButton({
  locale,
  label,
  ariaLabel,
  className,
}: {
  locale: Locale;
  label: string;
  ariaLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';
  const qFromURL = isHome ? (searchParams.get('q') ?? '') : '';

  const t = getMessages(locale).appShell;

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestRow[]>([]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isHome) return;
    const id = requestAnimationFrame(() => {
      setInputValue(qFromURL);
    });
    return () => cancelAnimationFrame(id);
  }, [isHome, qFromURL]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const runSuggest = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/restaurants/suggest?q=${encodeURIComponent(trimmed)}&limit=8`,
        { signal: ctrl.signal },
      );
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as { items?: SuggestRow[] };
      setSuggestions(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function scheduleSuggest(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSuggest(q);
    }, SUGGEST_DEBOUNCE_MS);
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function applySearchToMain() {
    const q = inputValue.trim();
    const next = new URLSearchParams(isHome ? searchParams.toString() : '');
    if (q) next.set('q', q);
    else next.delete('q');
    next.delete('page');
    const href = next.toString() ? `/?${next.toString()}` : '/';
    router.push(href, { scroll: false });
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applySearchToMain();
  }

  return (
    <div ref={wrapRef} className={cn('relative hidden md:block', className)}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
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
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              setOpen(true);
              if (!v.trim()) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                abortRef.current?.abort();
                setSuggestions([]);
                setLoading(false);
                setOpen(false);
                return;
              }
              setLoading(true);
              scheduleSuggest(v);
            }}
            onFocus={() => {
              setOpen(true);
              if (inputValue.trim()) scheduleSuggest(inputValue);
            }}
            placeholder={label}
            aria-label={ariaLabel}
            autoComplete="off"
            className="h-10 w-56 rounded-full border border-border/75 bg-surface pl-10 pr-4 text-sm leading-10 text-foreground outline-none transition placeholder:text-xs placeholder:font-semibold placeholder:text-foreground/70 hover:placeholder:text-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </form>

      {open && (inputValue.trim() !== '' || loading) ? (
        <div
          id="header-search-suggest"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border/50 bg-surface py-1 shadow-elev-2"
          aria-label={ariaLabel}
        >
          {loading && inputValue.trim() ? (
            <p className="px-3 py-2.5 text-sm text-muted">{t.searchSuggestLoading}</p>
          ) : null}
          {!loading && inputValue.trim() && suggestions.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted">{t.searchSuggestNoHits}</p>
          ) : null}
          {!loading && suggestions.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((row) => (
                <li key={row.slug}>
                  <Link
                    href={`/restaurants/${row.slug}`}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    className="flex flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-accent-bg/70"
                  >
                    <span className="text-sm font-semibold text-foreground">{row.name}</span>
                    {row.cuisine ? (
                      <span className="text-[11px] text-muted">{row.cuisine}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {inputValue.trim() ? (
            <div className="border-t border-border/40 p-2">
              <button
                type="button"
                onClick={() => applySearchToMain()}
                className="w-full rounded-xl border border-accent-border/50 bg-accent-bg/50 px-3 py-2 text-center text-sm font-semibold text-accent-text transition-colors hover:bg-accent-bg"
              >
                {t.searchSuggestShowAll}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
