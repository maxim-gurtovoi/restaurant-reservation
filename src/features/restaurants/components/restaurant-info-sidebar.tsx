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

function getOpenStatus(workingHours: WorkingHoursItem[]): { label: string; tone: string } {
  const now = new Date();
  const today = now.getDay();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const nowTime = `${hh}:${mm}`;

  const schedule = workingHours.find((wh) => wh.dayOfWeek === today);
  if (!schedule || schedule.isClosed) {
    return { label: 'Closed now', tone: 'text-error' };
  }
  if (nowTime >= schedule.openTime && nowTime < schedule.closeTime) {
    return { label: 'Open now', tone: 'text-primary' };
  }
  return { label: 'Closed now', tone: 'text-error' };
}

export function RestaurantInfoSidebar({
  address,
  phone,
  email,
  workingHours,
}: RestaurantInfoSidebarProps) {
  const orderedHours = [...workingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const openStatus = getOpenStatus(orderedHours);

  return (
    <aside className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-sm lg:sticky lg:top-24">
      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
        >
          {phone ? `Call ${phone}` : 'Call restaurant'}
        </button>
        <p className={`text-xs font-medium ${openStatus.tone}`}>{openStatus.label}</p>
      </div>

      <section className="space-y-2 border-t border-border pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Working hours</h3>
        <div className="space-y-1.5 text-sm text-foreground">
          {orderedHours.length ? (
            orderedHours.map((wh) => (
              <div key={`${wh.dayOfWeek}-${wh.openTime}`} className="flex items-start justify-between gap-3">
                <span className="text-muted">{DAY_LABELS[wh.dayOfWeek] ?? `Day ${wh.dayOfWeek}`}</span>
                <span>{wh.isClosed ? 'Closed' : `${wh.openTime} - ${wh.closeTime}`}</span>
              </div>
            ))
          ) : (
            <p className="text-muted">Working hours are not available.</p>
          )}
        </div>
      </section>

      <section className="space-y-2 border-t border-border pt-3 text-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Address</h3>
        <p className="text-foreground">{address ?? 'Address not provided'}</p>
      </section>

      {(email || phone) && (
        <section className="space-y-2 border-t border-border pt-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Contacts</h3>
          {phone ? <p className="text-foreground">Phone: {phone}</p> : null}
          {email ? <p className="text-foreground">Email: {email}</p> : null}
        </section>
      )}
    </aside>
  );
}

