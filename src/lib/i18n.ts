import 'server-only';
import { cookies } from 'next/headers';

export type Locale = 'ru' | 'ro';

export const LANG_COOKIE_KEY = 'tableflow-lang';

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'ro' ? 'ro' : 'ru';
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LANG_COOKIE_KEY)?.value);
}

