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
};

const DAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
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
    return { text: 'Closed', emphasized: false };
  }

  const openMins = parseHHmmToMinutes(item.openTime);
  const closeMins = parseHHmmToMinutes(item.closeTime);
  if (openMins === null || closeMins === null || closeMins <= openMins) {
    return { text: 'Unavailable', emphasized: false };
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
      label: DAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`,
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
    return { label: 'Open now', tone: 'text-primary' };
  }

  if (
    result.code === WORKING_HOURS_ERROR_CODES.NO_WORKING_HOURS_FOR_DAY ||
    result.code === WORKING_HOURS_ERROR_CODES.RESTAURANT_CLOSED ||
    result.code === WORKING_HOURS_ERROR_CODES.OUTSIDE_WORKING_HOURS
  ) {
    return { label: 'Closed now', tone: 'text-error' };
  }

  return { label: 'Hours unavailable', tone: 'text-muted' };
}

export function RestaurantInfoSidebar({
  address,
  phone,
  email,
  workingHours,
}: RestaurantInfoSidebarProps) {
  const openStatus = getOpenStatus(workingHours);
  const weeklyRows = buildWeeklyRows(workingHours);

  return (
    <aside className="space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card lg:sticky lg:top-24">
      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(123,47,155,0.25),0_8px_20px_rgba(123,47,155,0.15)] transition hover:bg-primary-hover"
        >
          {phone ? `Call ${phone}` : 'Call restaurant'}
        </button>
        <p className={`text-xs font-medium ${openStatus.tone}`}>{openStatus.label}</p>
      </div>

      <section className="space-y-2 border-t border-border/60 pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Working hours</h3>
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
                {row.isToday ? ' · Today' : ''}
              </span>
              <span className={row.isEmphasized ? 'text-foreground' : 'text-muted'}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 border-t border-border/60 pt-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Address</h3>
        <p className="wrap-break-word text-foreground">{address ?? 'Address not provided'}</p>
      </section>

      {(email || phone) && (
        <section className="space-y-2 border-t border-border/60 pt-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">Contacts</h3>
          {phone ? <p className="text-foreground">Phone: {phone}</p> : null}
          {email ? <p className="text-foreground">Email: {email}</p> : null}
        </section>
      )}
    </aside>
  );
}

