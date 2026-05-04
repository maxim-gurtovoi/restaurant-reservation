import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import {
  parseStatusFilterParam,
  parseTimeFilterParam,
} from '@/features/admin/lib/admin-reservation-filters';
import {
  getAdminTodayReservationSummary,
  listAdminReservations,
} from '@/features/admin/server/admin.service';
import { AdminReservationsView } from '@/features/admin/components/admin-reservations-view';

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();
  const params = (await searchParams) ?? {};
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const rawTime = Array.isArray(params.time) ? params.time[0] : params.time;

  const page = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const status = parseStatusFilterParam(rawStatus);
  const time = parseTimeFilterParam(rawTime);

  const [result, summary] = await Promise.all([
    listAdminReservations({
      adminUserId: user.id,
      page: Number.isFinite(page) ? page : 1,
      status,
      time,
    }),
    getAdminTodayReservationSummary(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Брони"
        subtitle="Просмотр броней по вашим ресторанам и управление посещениями."
      />
      {'error' in result.body ? (
        <p className="text-sm text-red-300">{result.body.error}</p>
      ) : (
        <AdminReservationsView
          reservations={result.body.items}
          page={result.body.page}
          totalPages={result.body.totalPages}
          total={result.body.total}
          statusFilter={status}
          timeFilter={time}
          todaySummary={summary}
        />
      )}
    </div>
  );
}
