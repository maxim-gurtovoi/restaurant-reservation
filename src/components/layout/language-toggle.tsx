'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';

type Lang = 'ru' | 'ro';

const LANG_COOKIE_KEY = 'tableflow-lang';

export function LanguageToggle({
  locale,
  ariaLabel,
}: {
  locale: Locale;
  ariaLabel: string;
}) {
  const router = useRouter();
  // Optimistic value updates instantly on click for visual feedback,
  // then snaps back to `locale` once the RSC refresh resolves.
  const [lang, setOptimisticLang] = useOptimistic<Lang>(locale);
  const [, startTransition] = useTransition();

  const toggleLanguage = () => {
    const next: Lang = lang === 'ru' ? 'ro' : 'ru';
    document.cookie = `${LANG_COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      setOptimisticLang(next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative inline-flex h-10 items-center rounded-full border border-border/70 bg-surface/90 p-1 text-xs font-semibold"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-foreground/90 transition-all duration-200',
          lang === 'ru' ? 'left-1' : 'left-[calc(50%+0.125rem)]',
        )}
      />
      <span
        className={cn(
          'relative z-10 inline-flex h-8 min-w-[2.8rem] items-center justify-center rounded-full px-3 transition-colors',
          lang === 'ru' ? 'text-white' : 'text-foreground/70 hover:text-foreground',
        )}
      >
        RU
      </span>
      <span
        className={cn(
          'relative z-10 inline-flex h-8 min-w-[2.8rem] items-center justify-center rounded-full px-3 transition-colors',
          lang === 'ro' ? 'text-white' : 'text-foreground/70 hover:text-foreground',
        )}
      >
        RO
      </span>
    </button>
  );
}

