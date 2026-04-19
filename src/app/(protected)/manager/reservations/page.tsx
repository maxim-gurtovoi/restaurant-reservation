import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import {
  parseStatusFilterParam,
  parseTimeFilterParam,
} from '@/features/manager/lib/manager-reservation-filters';
import {
  getManagerTodayReservationSummary,
  listManagerReservations,
} from '@/features/manager/server/manager.service';
import { ManagerReservationsView } from '@/features/manager/components/manager-reservations-view';

export default async function ManagerReservationsPage({
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
    listManagerReservations({
      managerUserId: user.id,
      page: Number.isFinite(page) ? page : 1,
      status,
      time,
    }),
    getManagerTodayReservationSummary(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Брони"
        subtitle="Просмотр броней по вашим ресторанам и управление заселением."
      />
      {'error' in result.body ? (
        <p className="text-sm text-red-300">{result.body.error}</p>
      ) : (
        <ManagerReservationsView
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
