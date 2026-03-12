import { PageHeader } from '@/components/ui/page-header';
import { ReservationsList } from '@/features/reservations/components/reservations-list';

export default function MyReservationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My reservations"
        subtitle="Review and manage your upcoming reservations."
      />
      <ReservationsList />
    </div>
  );
}

