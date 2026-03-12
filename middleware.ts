import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { verifyUserJwt } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));

  const user = verifyUserJwt(token);
  if (!user) return NextResponse.redirect(new URL('/auth/login', req.url));

  // TODO: enforce role for /manager paths
  return NextResponse.next();
}

export const config = {
  matcher: ['/my-reservations/:path*', '/manager/:path*'],
};

