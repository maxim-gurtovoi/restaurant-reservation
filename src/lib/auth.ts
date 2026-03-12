import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import type { JwtPayloadUser } from '@/types/auth';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail fast in dev/prod if env is misconfigured
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function signUserJwt(payload: JwtPayloadUser): string {
  // TODO: tune expiration and claims
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyUserJwt(token: string): JwtPayloadUser | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayloadUser;
  } catch {
    return null;
  }
}

export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return token ?? null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    // TODO: align with JWT expiration
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}

