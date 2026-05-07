import 'server-only';
import { Prisma } from '@prisma/client';
import { randomInt, randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getRestaurantIanaZone } from '@/lib/restaurant-time';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { ensureWorkingHoursAllowReservation } from '@/features/reservations/server/working-hours-validation';
import { prismaWhereBlockingReservationOverlap } from '@/features/reservations/server/reservation-blocking';

const MAX_ATTEMPTS = 8;

function generateReferenceCode(): string {
  return String(randomInt(1_000_000, 10_000_000));
}

function isReferenceCodeUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return (
    error.code === 'P2002' &&
    (Array.isArray(error.meta?.target)
      ? error.meta.target.includes('referenceCode')
      : String(error.meta?.target).includes('referenceCode'))
  );
}

/**
 * P2034 — the DB rolled back the transaction due to a serialization conflict with a
 * concurrent booking.  We retry so that the overlap check re-runs and returns the
 * correct user-facing error ("table no longer available") instead of a raw DB error.
 */
function isSerializationFailure(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
  );
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

  // Single restaurant fetch: result is reused for timezone resolution and
  // passed into ensureWorkingHoursAllowReservation to skip a second SELECT.
  const restaurantRow = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { timeZone: true },
  });
  const timeZone = getRestaurantIanaZone(restaurantRow ?? { timeZone: null });

  const { startAt, endAt } = computeReservationWindow({ date, time, timeZone });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
    timeZone,
  });

  const table = await prisma.restaurantTable.findFirst({
    where: { id: tableId, restaurantId, isActive: true },
    include: { restaurant: { select: { name: true } } },
  });

  if (!table) {
    throw new Error('Table not found or inactive');
  }

  if (guestCount > table.capacity) {
    throw new Error('Guest count exceeds table capacity');
  }

  const qrToken = randomUUID();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const referenceCode = generateReferenceCode();
    try {
      // Serializable isolation makes the overlap check and the insert atomic:
      // a concurrent booking on the same slot will cause one of the two
      // transactions to fail with P2034, which we retry below.
      const reservation = await prisma.$transaction(
        async (tx) => {
          const blocking = await tx.reservation.findMany({
            where: prismaWhereBlockingReservationOverlap({
              restaurantId,
              requestedStartAt: startAt,
              requestedEndAt: endAt,
              now: new Date(),
              tableId,
            }),
            select: { id: true },
          });

          if (blocking.length > 0) {
            throw new Error('Table is no longer available for the requested time');
          }

          return tx.reservation.create({
            data: {
              userId,
              restaurantId,
              tableId,
              startAt,
              endAt,
              guestCount,
              status: 'CONFIRMED',
              qrToken,
              referenceCode,
              contactName: input.contactName?.trim() || '',
              contactPhone: input.contactPhone?.trim() || null,
              contactEmail: input.contactEmail?.trim() || null,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return {
        id: reservation.id,
        qrToken: reservation.qrToken,
        startAt: reservation.startAt.toISOString(),
        endAt: reservation.endAt.toISOString(),
        tableLabel: table.label,
        restaurantName: table.restaurant.name,
      };
    } catch (error) {
      if (isReferenceCodeUniqueViolation(error)) continue;
      if (isSerializationFailure(error)) continue;
      throw error;
    }
  }

  throw new Error('Не удалось создать уникальный код брони. Попробуйте снова.');
}
