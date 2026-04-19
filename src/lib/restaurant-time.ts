import 'server-only';

/** Default when APP_TIMEZONE is unset (single-city demo; override via env). */
export const DEFAULT_APP_TIMEZONE = 'Europe/Chisinau';

export function getAppDefaultTimeZone(): string {
  const fromEnv = process.env.APP_TIMEZONE?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_APP_TIMEZONE;
}

/** Effective IANA timezone for a restaurant row (nullable DB field → app default). */
export function getRestaurantIanaZone(restaurant: { timeZone?: string | null }): string {
  const z = restaurant.timeZone?.trim();
  return z && z.length > 0 ? z : getAppDefaultTimeZone();
}
