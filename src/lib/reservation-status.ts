export function formatReservationStatus(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'CHECKED_IN':
      return 'Checked in';
    case 'CANCELLED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    case 'NO_SHOW':
      return 'No show';
    default:
      return status;
  }
}

