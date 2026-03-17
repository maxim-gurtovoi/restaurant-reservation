import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import { listManagerReservations } from '@/features/manager/server/manager.service';
import { ManagerReservationsList } from '@/features/manager/components/manager-reservations-list';

export default async function ManagerReservationsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const result = await listManagerReservations({ managerUserId: user.id });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        subtitle="View reservations for your restaurants and manage check-ins."
      />
      {'error' in result.body ? (
        <p className="text-sm text-red-300">{result.body.error}</p>
      ) : (
        <ManagerReservationsList reservations={result.body} />
      )}
    </div>
  );
}

