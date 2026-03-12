import { PageHeader } from '@/components/ui/page-header';

export default function ManagerReservationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        subtitle="See and manage reservations for your restaurant."
      />
      <p className="text-sm text-slate-400">
        {/* TODO: replace with manager reservations table */}
        Manager reservations view will show upcoming reservations, statuses, and
        actions like check-in or cancel.
      </p>
    </div>
  );
}

