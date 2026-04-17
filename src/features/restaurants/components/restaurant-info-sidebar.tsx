import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  WORKING_HOURS_ERROR_CODES,
  validateReservationAgainstWorkingHours,
} from '@/features/reservations/server/working-hours-validation';

type WorkingHoursItem = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type RestaurantInfoSidebarProps = {
  address: string | null;
  phone: string | null;
  email: string | null;
  workingHours: WorkingHoursItem[];
  reserveHref?: string;
};

const DAY_LABELS: Record<number, string> = {
  0: 'Воскресенье',
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
  6: 'Суббота',
};

type StatusBadge = {
  label: string;
  tone: string;
};

type WeekRow = {
  dayOfWeek: number;
  label: string;
  isToday: boolean;
  value: string;
  isEmphasized: boolean;
};

function parseHHmmToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

function formatWorkingHoursValue(item: WorkingHoursItem | undefined): {
  text: string;
  emphasized: boolean;
} {
  if (!item || item.isClosed) {
    return { text: 'Выходной', emphasized: false };
  }

  const openMins = parseHHmmToMinutes(item.openTime);
  const closeMins = parseHHmmToMinutes(item.closeTime);
  if (openMins === null || closeMins === null || closeMins <= openMins) {
    return { text: 'Недоступно', emphasized: false };
  }

  return { text: `${item.openTime} - ${item.closeTime}`, emphasized: true };
}

function buildWeeklyRows(workingHours: WorkingHoursItem[]): WeekRow[] {
  const now = new Date();
  const today = now.getDay();
  const byDay = new Map(workingHours.map((item) => [item.dayOfWeek, item]));

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const item = byDay.get(dayOfWeek);
    const value = formatWorkingHoursValue(item);
    return {
      dayOfWeek,
      label: DAY_LABELS[dayOfWeek] ?? `День ${dayOfWeek}`,
      isToday: dayOfWeek === today,
      value: value.text,
      isEmphasized: value.emphasized,
    };
  });
}

function getOpenStatus(workingHours: WorkingHoursItem[]): StatusBadge {
  const now = new Date();
  const minuteLater = new Date(now.getTime() + 60 * 1000);
  const result = validateReservationAgainstWorkingHours({
    workingHours,
    startAt: now,
    endAt: minuteLater,
  });

  if (result.valid) {
    return { label: 'Сейчас открыто', tone: 'text-primary' };
  }

  if (
    result.code === WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY ||
    result.code === WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED ||
    result.code === WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS
  ) {
    return { label: 'Сейчас закрыто', tone: 'text-error' };
  }

  return { label: 'Часы работы недоступны', tone: 'text-muted' };
}

export function RestaurantInfoSidebar({
  address,
  phone,
  email,
  workingHours,
  reserveHref,
}: RestaurantInfoSidebarProps) {
  const openStatus = getOpenStatus(workingHours);
  const weeklyRows = buildWeeklyRows(workingHours);

  return (
    <aside className="space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card lg:sticky lg:top-24">
      <div className="space-y-2">
        {reserveHref ? (
          <Button asChild variant="primary" className="w-full py-2.5 text-sm font-semibold">
            <Link href={reserveHref}>Забронировать столик</Link>
          </Button>
        ) : null}
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(123,47,155,0.25),0_8px_20px_rgba(123,47,155,0.15)] transition hover:bg-primary-hover"
        >
          {phone ? `Позвонить: ${phone}` : 'Позвонить в ресторан'}
        </button>
        <p className={`text-xs font-medium ${openStatus.tone}`}>{openStatus.label}</p>
      </div>

      <section className="space-y-2 border-t border-border/60 pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Часы работы</h3>
        <div className="space-y-1.5 text-sm text-foreground">
          {weeklyRows.map((row) => (
            <div
              key={row.dayOfWeek}
              className={[
                'flex items-start justify-between gap-3 rounded-lg px-2.5 py-1.5',
                row.isToday ? 'border border-accent-border/40 bg-accent-bg/50' : '',
              ].join(' ')}
            >
              <span className={row.isToday ? 'font-semibold text-accent-text' : 'text-muted'}>
                {row.label}
                {row.isToday ? ' · сегодня' : ''}
              </span>
              <span className={row.isEmphasized ? 'text-foreground' : 'text-muted'}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 border-t border-border/60 pt-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Адрес</h3>
        <p className="wrap-break-word text-foreground">{address ?? 'Адрес не указан'}</p>
      </section>

      {(email || phone) && (
        <section className="space-y-2 border-t border-border/60 pt-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Контакты</h3>
          {phone ? <p className="text-foreground">Телефон: {phone}</p> : null}
          {email ? <p className="text-foreground">Email: {email}</p> : null}
        </section>
      )}
    </aside>
  );
}

