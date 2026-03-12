// TODO: replace with server-loaded reservations list
const MOCK_RESERVATIONS = [
  {
    id: 'r1',
    restaurantName: 'Ocean Breeze',
    date: '2026-04-01',
    time: '19:00',
    guests: 2,
    status: 'CONFIRMED',
  },
];

export function ReservationsList() {
  if (!MOCK_RESERVATIONS.length) {
    return (
      <p className="text-sm text-slate-400">
        You have no upcoming reservations yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {MOCK_RESERVATIONS.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">{r.restaurantName}</p>
            <p className="text-xs text-slate-400">
              {r.date} at {r.time} · {r.guests} guests
            </p>
          </div>
          <span className="text-xs text-emerald-400">
            {r.status.toLowerCase()}
          </span>
        </li>
      ))}
    </ul>
  );
}

