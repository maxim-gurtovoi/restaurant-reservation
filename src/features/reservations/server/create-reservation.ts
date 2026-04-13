import 'server-only';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { ensureWorkingHoursAllowReservation } from '@/features/reservations/server/working-hours-validation';

function generateQRToken(): string {
  return randomUUID();
}

export async function createReservation(input: {
  userId: string;
  restaurantId: string;
  tableId: string;
  date: string;
  time: string;
  guestCount: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): Promise<{
  id: string;
  qrToken: string;
  startAt: string;
  endAt: string;
  tableLabel: string;
  restaurantName: string;
}> {
  const { userId, restaurantId, tableId, date, time, guestCount } = input;

  const { startAt, endAt } = computeReservationWindow({ date, time });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
  });

  // Validate table exists and belongs to restaurant
  const table = await prisma.restaurantTable.findFirst({
    where: {
      id: tableId,
      restaurantId,
      isActive: true,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error('Столик не найден или неактивен');
  }

  // Validate guest count doesn't exceed capacity
  if (guestCount > table.capacity) {
    throw new Error('Число гостей превышает вместимость столика');
  }

  // Re-check availability with same logic as availability check
  const blockingReservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      tableId,
      status: {
        in: ['CONFIRMED', 'CHECKED_IN'],
      },
      startAt: {
        lt: endAt,
      },
      endAt: {
        gt: startAt,
      },
    },
    select: {
      id: true,
    },
  });

  if (blockingReservations.length > 0) {
    throw new Error('Столик уже занят на выбранное время');
  }

  // Generate QR token
  const qrToken = generateQRToken();

  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      userId,
      restaurantId,
      tableId,
      startAt,
      endAt,
      guestCount,
      status: 'CONFIRMED',
      qrToken,
      contactName: input.contactName || '',
      contactPhone: input.contactPhone || null,
      contactEmail: input.contactEmail || null,
    },
  });

  return {
    id: reservation.id,
    qrToken: reservation.qrToken,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    tableLabel: table.label,
    restaurantName: table.restaurant.name,
  };
}
