import { NextResponse, type NextRequest } from 'next/server';
import { buildAdminReservationsExportCsv } from '@/features/admin/server/admin.service';
import {
  parseStatusFilterParam,
  parseTimeFilterParam,
} from '@/features/admin/lib/admin-reservation-filters';
import { getCurrentUser } from '@/server/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = parseStatusFilterParam(req.nextUrl.searchParams.get('status') ?? undefined);
  const time = parseTimeFilterParam(req.nextUrl.searchParams.get('time') ?? undefined);

  const csv = await buildAdminReservationsExportCsv({
    adminUserId: user.id,
    status,
    time,
  });

  const res = new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reservations.csv"',
    },
  });
  return res;
}
