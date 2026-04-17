'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Lang = 'ru' | 'ro';

const STORAGE_KEY = 'tableflow-lang';
const LANG_COOKIE_KEY = 'tableflow-lang';

export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'ro') {
      setLang(saved);
    }
  }, []);

  const setLanguage = (next: Lang) => {
    setLang(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${LANG_COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  const toggleLanguage = () => {
    const next = lang === 'ru' ? 'ro' : 'ru';
    setLanguage(next);
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative inline-flex h-10 items-center rounded-full border border-border/70 bg-surface/90 p-1 text-xs font-semibold"
      aria-label={`Текущий язык: ${lang.toUpperCase()}. Нажмите, чтобы переключить язык`}
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

