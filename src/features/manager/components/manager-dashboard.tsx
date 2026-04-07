import type { ManagerDashboardStats } from '@/features/manager/server/manager.service';

export function ManagerDashboard({ stats }: { stats: ManagerDashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Today's reservations" value={String(stats.todayReservations)} icon="📅" />
      <Stat label="Guests checked in today" value={String(stats.checkedInToday)} icon="✅" />
      <Stat label="Upcoming reservations" value={String(stats.upcomingReservations)} icon="⏳" />
      <Stat label="Managed restaurants" value={String(stats.managedRestaurants)} icon="🍽️" />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        <span className="text-base opacity-60">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
