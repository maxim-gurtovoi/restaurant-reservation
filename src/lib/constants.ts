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
  myFavorites: '/my-favorites',
  adminDashboard: '/admin/dashboard',
  adminReservations: '/admin/reservations',
  manager: '/manager',
  managerFloorPlan: '/manager/floor-plan',
  managerFloorPlanEdit: '/manager/floor-plan',
  privacy: '/privacy',
  terms: '/terms',
} as const;

/**
 * USER — guest. ADMIN — hall staff (RestaurantAdmin). MANAGER — one restaurant (Restaurant.managerUserId).
 * OWNER — platform: create restaurants; global /manager overview (no hall /admin panel by default).
 */
export const ROLE = {
  user: 'USER',
  admin: 'ADMIN',
  manager: 'MANAGER',
  owner: 'OWNER',
} as const;

