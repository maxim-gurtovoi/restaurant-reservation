import type { ManagerDashboardStats } from '@/features/manager/server/manager.service';

export function ManagerDashboard({ stats }: { stats: ManagerDashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Today&apos;s reservations" value={String(stats.todayReservations)} />
      <Stat label="Guests checked in today" value={String(stats.checkedInToday)} />
      <Stat label="Upcoming reservations" value={String(stats.upcomingReservations)} />
      <Stat label="Managed restaurants" value={String(stats.managedRestaurants)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

