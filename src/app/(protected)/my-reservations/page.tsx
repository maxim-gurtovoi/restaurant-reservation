import { PageHeader } from '@/components/ui/page-header';
import { getCurrentUser } from '@/server/auth';
import { listUserReservations } from '@/features/reservations/server/reservations.service';
import { MyReservationsList } from '@/features/reservations/components/my-reservations-list';
import { notFound } from 'next/navigation';

export default async function MyReservationsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const result = await listUserReservations({ userId: user.id });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My reservations"
        subtitle="Review and manage your upcoming reservations."
      />
      {'error' in result.body ? (
        <p className="text-sm text-red-300">{result.body.error}</p>
      ) : (
        <MyReservationsList reservations={result.body} />
      )}
    </div>
  );
}

