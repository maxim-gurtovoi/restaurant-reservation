export const AUTH_COOKIE_NAME = 'reservation_jwt';

/** Locale for dates, times, and copy across the Russian UI. */
export const UI_LOCALE = 'ru-RU' as const;

export const ROUTES = {
  home: '/',
  restaurants: '/restaurants',
  login: '/auth/login',
  register: '/auth/register',
  myReservations: '/my-reservations',
  managerDashboard: '/manager/dashboard',
  managerReservations: '/manager/reservations',
  managerFloorPlan: '/manager/floor-plan',
  admin: '/admin',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export const ROLE = {
  user: 'USER',
  manager: 'MANAGER',
  admin: 'ADMIN',
} as const;

