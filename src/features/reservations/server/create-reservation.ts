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

  const reservation = await prisma.$transaction(async (tx) => {
    // Lock the table row to serialize concurrent bookings for the same table.
    await tx.$executeRaw`
      SELECT 1
      FROM "RestaurantTable"
      WHERE "id" = ${tableId}
      FOR UPDATE
    `;

    const table = await tx.restaurantTable.findFirst({
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

    if (guestCount > table.capacity) {
      throw new Error('Число гостей превышает вместимость столика');
    }

    const blockingReservations = await tx.reservation.count({
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
    });

    if (blockingReservations > 0) {
      throw new Error('Столик уже занят на выбранное время');
    }

    const qrToken = generateQRToken();
    const created = await tx.reservation.create({
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
      select: {
        id: true,
        qrToken: true,
        startAt: true,
        endAt: true,
      },
    });

    return {
      reservation: created,
      tableLabel: table.label,
      restaurantName: table.restaurant.name,
    };
  });

  return {
    id: reservation.reservation.id,
    qrToken: reservation.reservation.qrToken,
    startAt: reservation.reservation.startAt.toISOString(),
    endAt: reservation.reservation.endAt.toISOString(),
    tableLabel: reservation.tableLabel,
    restaurantName: reservation.restaurantName,
  };
}
