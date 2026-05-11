import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';

export type Locale = 'ru' | 'ro';

export const LANG_COOKIE_KEY = 'tableflow-lang';

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'ro' ? 'ro' : 'ru';
}

/**
 * Per-request memo: layout/page/RSC-компоненты обычно зовут локаль независимо,
 * `cache` сохраняет один cookie-read и парсинг на весь рендер.
 */
export const getServerLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LANG_COOKIE_KEY)?.value);
});

