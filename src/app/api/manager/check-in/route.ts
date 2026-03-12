import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/server/auth';
import { performCheckIn } from '@/features/manager/server/manager.service';

export async function POST(req: NextRequest) {
  const manager = await getCurrentUser();
  // TODO: enforce manager role (not just auth)
  if (!manager) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // TODO: validate with Zod schema
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await performCheckIn({ managerId: manager.id, ...payload });
  return NextResponse.json(result.body, { status: result.status });
}

