import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getAuthTokenFromCookies, verifyUserJwt } from '@/lib/auth';
import type { JwtPayloadUser } from '@/types/auth';

/**
 * Per-request memo: layout + page часто оба вызывают `getCurrentUser`,
 * без `cache` мы каждый раз читаем cookies и валидируем JWT повторно.
 */
export const getCurrentUser = cache(
  async (): Promise<JwtPayloadUser | null> => {
    const token = await getAuthTokenFromCookies();
    if (!token) return null;
    return verifyUserJwt(token);
  },
);

export async function requireUser(): Promise<JwtPayloadUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return user;
}

/**
 * Allows ADMIN (hall staff) and MANAGER (restaurant manager, hall tooling).
 * Used to gate all `/admin/*` routes (check-in, reservations). Floor plan UI is under `/manager/floor-plan`.
 */
export async function requireAdmin(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    redirect('/');
  }
  return user;
}

/** Platform owner only: create restaurants, global manager overview. */
export async function requireOwner(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'OWNER') {
    redirect('/');
  }
  return user;
}

/** `/manager` shell: OWNER or MANAGER. */
export async function requireManagerShell(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'MANAGER' && user.role !== 'OWNER') {
    redirect('/');
  }
  return user;
}

/**
 * Restaurant manager only (staff assignment + floor plan for their venue).
 * Not for OWNER unless they are also MANAGER (separate account in practice).
 */
export async function requireManager(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'MANAGER') {
    redirect('/');
  }
  return user;
}
