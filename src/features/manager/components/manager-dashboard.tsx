export function ManagerDashboard() {
  // TODO: replace with real stats aggregated from reservations
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Today’s reservations" value="12" />
      <Stat label="Checked-in" value="7" />
      <Stat label="Available tables" value="18" />
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

