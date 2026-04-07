// TODO: replace with server-loaded reservations list
const MOCK_RESERVATIONS = [
  {
    id: 'r1',
    restaurantName: 'Gastrobar',
    date: '2026-04-01',
    time: '19:00',
    guests: 2,
    status: 'CONFIRMED',
  },
];

export function ReservationsList() {
  if (!MOCK_RESERVATIONS.length) {
    return (
      <p className="text-sm text-muted">
        You have no upcoming reservations yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {MOCK_RESERVATIONS.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-sm shadow-sm"
        >
          <div>
            <p className="font-medium text-foreground">{r.restaurantName}</p>
            <p className="text-xs text-muted">
              {r.date} at {r.time} · {r.guests} guests
            </p>
          </div>
          <span className="text-xs font-medium text-accent-text">
            {r.status.toLowerCase()}
          </span>
        </li>
      ))}
    </ul>
  );
}
