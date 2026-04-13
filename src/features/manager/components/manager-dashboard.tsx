import type { ManagerDashboardStats } from '@/features/manager/server/manager.service';

export function ManagerDashboard({ stats }: { stats: ManagerDashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Брони сегодня" value={String(stats.todayReservations)} icon="📅" />
      <Stat label="Заселено сегодня" value={String(stats.checkedInToday)} icon="✅" />
      <Stat label="Предстоящие брони" value={String(stats.upcomingReservations)} icon="⏳" />
      <Stat label="Рестораны под управлением" value={String(stats.managedRestaurants)} icon="🍽️" />
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
