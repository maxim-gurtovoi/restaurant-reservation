'use client';

import type { ReactNode } from 'react';
import type { ReservationStatus } from '@prisma/client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminDashboardStats } from '@/features/admin/server/admin.service';

const STATUS_LABEL_RU: Record<ReservationStatus, string> = {
  CONFIRMED: 'Подтверждено',
  CHECKED_IN: 'Зашли',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
  NO_SHOW: 'Не пришли',
};

const STATUS_COLOR: Record<ReservationStatus, string> = {
  CONFIRMED: '#6366f1',
  CHECKED_IN: '#22c55e',
  COMPLETED: '#14b8a6',
  CANCELLED: '#94a3b8',
  NO_SHOW: '#ef4444',
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</p>
      {subtitle ? <p className="mt-1 text-[11px] leading-snug text-muted">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function AdminDashboardCharts({ stats }: { stats: AdminDashboardStats }) {
  const pieRows = [...stats.todayByStatus]
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((x) => ({
      name: STATUS_LABEL_RU[x.status],
      value: x.count,
      status: x.status,
    }));

  const seatCap = stats.seatCapacity;
  const guestsCapped =
    seatCap > 0 ? Math.min(stats.todayGuestsBooked, seatCap) : stats.todayGuestsBooked;
  const freeSeats = seatCap > 0 ? Math.max(0, seatCap - guestsCapped) : 0;

  const capacityPie =
    seatCap > 0
      ? [
          { name: 'Гости в бронях', value: guestsCapped },
          { name: 'Свободно (места)', value: freeSeats },
        ]
      : [];

  const showCapacityRing = seatCap > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Статусы броней (сегодня)"
          subtitle="Сегодняшние брони по состоянию: кто ждёт гостей, кто уже зашёл, отмены и остальное."
        >
          {pieRows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              Нет броней со временем начала сегодня.
            </p>
          ) : (
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieRows}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieRows.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [Number(value ?? 0), String(name)]}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                      fontSize: 12,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Заполненность мест (оценка)"
          subtitle="Насколько заняты места по сегодняшним броням по сравнению со всеми местами за активными столами. В центре — примерная доля в процентах."
        >
          {!showCapacityRing ? (
            <p className="py-12 text-center text-sm text-muted">
              Нет данных для этой оценки — добавьте столы в зале в разделе плана зала.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative mx-auto h-[200px] w-full max-w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <Pie
                      data={capacityPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={86}
                      paddingAngle={1}
                    >
                      <Cell fill="#6366f1" stroke="transparent" />
                      <Cell fill="#cbd5e1" stroke="transparent" />
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [Number(value ?? 0), String(name)]}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="select-none text-2xl font-semibold tabular-nums leading-none text-foreground">
                    {stats.fillPercentToday != null ? `${stats.fillPercentToday}%` : '—'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[#6366f1]" aria-hidden />
                  Гости в бронях
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[#cbd5e1]" aria-hidden />
                  Свободно (места)
                </span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Брони по дням (7 дней)"
        subtitle="Последняя неделя: сколько броней приходится на каждый день."
      >
        <div className="h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekBookingTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
              <XAxis dataKey="labelShort" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip
                formatter={(value) => [Number(value ?? 0), 'Броней']}
                labelFormatter={(_, p) => {
                  const row = p?.[0]?.payload as { isoDate?: string } | undefined;
                  const raw = row?.isoDate;
                  if (!raw) return '';
                  const d = new Date(`${raw}T12:00:00`);
                  return Number.isNaN(d.getTime())
                    ? raw
                    : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Броней" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
