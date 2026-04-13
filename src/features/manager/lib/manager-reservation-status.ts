export function managerReservationStatusBadgeClass(status: string) {
  if (status === 'CANCELLED') return 'border-error/30 bg-error/8 text-error';
  if (status === 'NO_SHOW') return 'border-amber-200/80 bg-amber-50 text-amber-900';
  if (status === 'CHECKED_IN') return 'border-sky-200 bg-sky-50 text-sky-700';
  if (status === 'COMPLETED') return 'border-emerald-200/80 bg-emerald-50 text-emerald-900';
  if (status === 'CONFIRMED') return 'border-accent-border/70 bg-accent-bg text-accent-text';
  return 'border-border/60 bg-surface-soft text-muted';
}
