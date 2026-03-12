export const AUTH_COOKIE_NAME = 'reservation_jwt';

export const ROUTES = {
  home: '/',
  restaurants: '/restaurants',
  login: '/auth/login',
  register: '/auth/register',
  myReservations: '/my-reservations',
  managerDashboard: '/manager/dashboard',
} as const;

export const ROLE = {
  user: 'USER',
  manager: 'MANAGER',
  admin: 'ADMIN',
} as const;

