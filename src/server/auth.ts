import 'server-only';
import { getAuthTokenFromCookies, verifyUserJwt } from '@/lib/auth';
import type { JwtPayloadUser } from '@/types/auth';

export async function getCurrentUser(): Promise<JwtPayloadUser | null> {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;
  return verifyUserJwt(token);
}

// TODO: add role enforcement helpers (requireManager, requireAdmin)

