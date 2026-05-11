import { AdminDashboardCharts } from '@/features/admin/components/admin-dashboard-charts';
import type { AdminDashboardStats } from '@/features/admin/server/admin.service';

export function AdminDashboard({ stats }: { stats: AdminDashboardStats }) {
  const fill =
    stats.fillPercentToday != null ? `${stats.fillPercentToday}%` : '—';
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Брони сегодня" value={String(stats.todayReservations)} icon="📅" />
        <Stat label="Посещений сегодня" value={String(stats.checkedInToday)} icon="✅" />
        <Stat label="Предстоящие брони" value={String(stats.upcomingReservations)} icon="⏳" />
        <Stat label="Привязанные рестораны" value={String(stats.adminRestaurants)} icon="🍽️" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Активных столов" value={String(stats.activeTables)} icon="🪑" />
        <Stat
          label="Заполненность (оценка)"
          value={fill}
          icon="📊"
          hint="Примерно, насколько зал заполнен: гости по броням на сегодня и все места за столами."
        />
        <Stat label="Гостей в бронях сегодня" value={String(stats.todayGuestsBooked)} icon="👥" />
        <Stat label="Вместимость мест (столы)" value={String(stats.seatCapacity)} icon="💺" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Не пришли сегодня" value={String(stats.noShowToday)} icon="🚫" />
      </div>

      <AdminDashboardCharts stats={stats} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        <span className="text-base opacity-60">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-2 text-[11px] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}
