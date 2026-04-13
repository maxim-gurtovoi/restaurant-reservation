import 'server-only';
import type { ApiResult } from '@/types/common';
import type { JwtPayloadUser } from '@/types/auth';
import { signUserJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  phone: z.string().min(3).max(50).optional(),
});

export async function loginUser(input: unknown): Promise<ApiResult<{ token: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: 'Некорректные данные для входа' } };
  }

  const { email, password } = parsed.data;

  const userRecord = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, passwordHash: true },
  });

  if (!userRecord) {
    return { status: 401, body: { error: 'Неверный email или пароль' } };
  }

  const ok = await bcrypt.compare(password, userRecord.passwordHash);
  if (!ok) {
    return { status: 401, body: { error: 'Неверный email или пароль' } };
  }

  const payload: JwtPayloadUser = {
    id: userRecord.id,
    email: userRecord.email,
    role: userRecord.role,
  };

  const token = signUserJwt(payload);
  return { status: 200, body: { token } };
}

export async function registerUser(input: unknown): Promise<ApiResult<{ token: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 400, body: { error: 'Некорректные данные регистрации' } };
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { status: 409, body: { error: 'Этот email уже зарегистрирован' } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone ?? null,
      role: 'USER',
    },
    select: { id: true, email: true, role: true },
  });

  const payload: JwtPayloadUser = {
    id: created.id,
    email: created.email,
    role: created.role,
  };
  const token = signUserJwt(payload);

  return { status: 201, body: { token } };
}

