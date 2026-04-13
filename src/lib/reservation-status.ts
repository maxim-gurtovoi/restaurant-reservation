export function formatReservationStatus(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Подтверждено';
    case 'CHECKED_IN':
      return 'Гости за столом';
    case 'CANCELLED':
      return 'Отменено';
    case 'COMPLETED':
      return 'Завершено';
    case 'NO_SHOW':
      return 'Неявка';
    default:
      return status;
  }
}

