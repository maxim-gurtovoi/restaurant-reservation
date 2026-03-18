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

export async function requireManager(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
    redirect('/');
  }
  return user;
}

export async function requireAdmin(): Promise<JwtPayloadUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    redirect('/');
  }
  return user;
}

