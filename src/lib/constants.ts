export const AUTH_COOKIE_NAME = 'reservation_jwt';

/** Must match `expiresIn` in signUserJwt (7d). */
export const JWT_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Locale for dates, times, and copy across the Russian UI. */
export const UI_LOCALE = 'ru-RU' as const;

export const ROUTES = {
  home: '/',
  restaurants: '/restaurants',
  login: '/auth/login',
  register: '/auth/register',
  myReservations: '/my-reservations',
  adminDashboard: '/admin/dashboard',
  adminReservations: '/admin/reservations',
  adminFloorPlan: '/admin/floor-plan',
  manager: '/manager',
  managerFloorPlanEdit: '/manager/floor-plan',
  privacy: '/privacy',
  terms: '/terms',
} as const;

/**
 * Role hierarchy (lowest → highest): USER < ADMIN < MANAGER.
 * ADMIN = restaurant staff (check-in, reservations view). MANAGER = restaurant owner/platform operator.
 * Higher role inherits all permissions of the lower one.
 */
export const ROLE = {
  user: 'USER',
  admin: 'ADMIN',
  manager: 'MANAGER',
} as const;

