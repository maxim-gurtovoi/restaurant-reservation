import 'server-only';
import { redirect } from 'next/navigation';
import { getAuthTokenFromCookies, verifyUserJwt } from '@/lib/auth';
import type { JwtPayloadUser } from '@/types/auth';

export async function getCurrentUser(): Promise<JwtPayloadUser | null> {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;
  return verifyUserJwt(token);
}

export async function requireUser(): Promise<JwtPayloadUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return user;
}

/**
 * Allows ADMIN (restaurant staff) and MANAGER (higher in hierarchy).
 * Used to gate all `/admin/*` routes (check-in, reservations, floor-plan view).
 */
export async function requireAdmin(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    redirect('/');
  }
  return user;
}

/**
 * Top-tier role only: platform operator / restaurant owner. Used for `/manager/*`
 * routes (restaurant CRUD, admin-staff assignment, drag&drop floor plan editor).
 */
export async function requireManager(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'MANAGER') {
    redirect('/');
  }
  return user;
}
