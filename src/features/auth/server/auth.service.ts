import 'server-only';
import type { ApiResult } from '@/types/common';
import type { JwtPayloadUser } from '@/types/auth';
import { signUserJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// TODO: define DTOs + Zod schemas for auth
export async function loginUser(input: any): Promise<ApiResult<{ token: string }>> {
  void prisma; // TODO: replace with real Prisma lookup

  const user: JwtPayloadUser = {
    id: 'TODO-user-id',
    email: String(input?.email ?? 'user@example.com'),
    role: 'USER',
  };

  const token = signUserJwt(user);
  return { status: 200, body: { token } };
}

export async function registerUser(input: any): Promise<ApiResult<{ id: string }>> {
  void input;
  void prisma; // TODO: create user + hash password
  return { status: 201, body: { id: 'TODO-new-user-id' } };
}

