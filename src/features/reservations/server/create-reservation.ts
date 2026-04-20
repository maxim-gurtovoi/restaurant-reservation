import 'server-only';
import { randomInt, randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { computeReservationWindow } from '@/features/reservations/server/reservation-time';
import { getRestaurantIanaZoneById } from '@/features/reservations/server/restaurant-timezone.repository';
import { prismaWhereBlockingReservationOverlap } from '@/features/reservations/server/reservation-blocking';
import { ensureWorkingHoursAllowReservation } from '@/features/reservations/server/working-hours-validation';
import { isValidBookingPhone, normalizePhoneDigits } from '@/lib/guest-contact';

function generateQRToken(): string {
  return randomUUID();
}

/** 7-digit numeric code: 1_000_000 .. 9_999_999. No leading zero so length is stable. */
function generateReferenceCode(): string {
  return String(randomInt(1_000_000, 10_000_000));
}

const MAX_REFERENCE_CODE_RETRIES = 5;

/**
 * Detects Postgres unique-violation (P2002) on the Reservation.referenceCode column.
 * Prisma exposes conflicting targets in `meta.target`.
 */
function isReferenceCodeCollision(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;
  const target = (error.meta as { target?: unknown } | undefined)?.target;
  if (typeof target === 'string') return target.includes('referenceCode');
  if (Array.isArray(target)) return target.some((t) => String(t).includes('referenceCode'));
  // If target is missing (rare, depending on driver), allow retry — we generate a new code anyway.
  return true;
}

export async function createReservation(input: {
  userId: string | null;
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
  referenceCode: string;
  startAt: string;
  endAt: string;
  tableLabel: string;
  restaurantName: string;
}> {
  const { userId, restaurantId, tableId, date, time, guestCount } = input;

  const contactNameTrim = (input.contactName ?? '').trim();
  const phoneRaw = (input.contactPhone ?? '').trim();
  const phoneNorm = phoneRaw ? normalizePhoneDigits(phoneRaw) : '';

  if (!userId) {
    if (contactNameTrim.length < 2) {
      throw new Error('Укажите имя для брони');
    }
    if (!phoneNorm || !isValidBookingPhone(phoneNorm)) {
      throw new Error('Укажите корректный номер телефона');
    }
  } else {
    if (contactNameTrim.length < 2) {
      throw new Error('Укажите имя для брони');
    }
    if (!phoneNorm || !isValidBookingPhone(phoneNorm)) {
      throw new Error('Укажите телефон для связи по брони');
    }
  }

  const timeZone = await getRestaurantIanaZoneById(restaurantId);
  const { startAt, endAt } = computeReservationWindow({ date, time, timeZone });

  await ensureWorkingHoursAllowReservation({
    restaurantId,
    startAt,
    endAt,
  });

  const contactEmailTrim = (input.contactEmail ?? '').trim() || null;

  // Retry the whole transaction on referenceCode unique-violation.
  // Collisions are rare (random 7-digit space is 9_000_000) but possible at scale;
  // Postgres aborts the current tx on unique violation, so we cannot retry the
  // INSERT inline without SAVEPOINTs — retrying the tx is simpler and safe here
  // (availability + locking checks are repeated with fresh data).
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_REFERENCE_CODE_RETRIES; attempt += 1) {
    const referenceCode = generateReferenceCode();
    try {
      const reservation = await prisma.$transaction(async (tx) => {
        // Lock the table row to serialize concurrent bookings for the same table.
        await tx.$executeRaw`
          SELECT 1
          FROM "RestaurantTable"
          WHERE "id" = ${tableId}::uuid
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

        const now = new Date();
        const blockingReservations = await tx.reservation.count({
          where: prismaWhereBlockingReservationOverlap({
            restaurantId,
            requestedStartAt: startAt,
            requestedEndAt: endAt,
            now,
            tableId,
          }),
        });

        if (blockingReservations > 0) {
          throw new Error('Столик уже занят на выбранное время');
        }

        const qrToken = generateQRToken();
        const reservationId = randomUUID();
        const userIdSql =
          userId != null && userId.length > 0
            ? Prisma.sql`${userId}::uuid`
            : Prisma.sql`NULL`;
        const contactEmailSql = contactEmailTrim
          ? Prisma.sql`${contactEmailTrim}`
          : Prisma.sql`NULL`;

        // Prisma 6.x в ряде случаев ошибочно требует nested `user` при `create`, хотя `userId` в схеме optional.
        // Параметризованный INSERT обходит клиентскую валидацию и сохраняет `userId` = NULL для гостевой брони.
        const inserted = await tx.$queryRaw<
          { id: string; qrToken: string; referenceCode: string; startAt: Date; endAt: Date }[]
        >(Prisma.sql`
          INSERT INTO "Reservation" (
            "id",
            "userId",
            "restaurantId",
            "tableId",
            "guestCount",
            "startAt",
            "endAt",
            "status",
            "qrToken",
            "referenceCode",
            "contactName",
            "contactPhone",
            "contactEmail",
            "createdAt",
            "updatedAt"
          ) VALUES (
            ${reservationId}::uuid,
            ${userIdSql},
            ${restaurantId}::uuid,
            ${tableId}::uuid,
            ${guestCount},
            ${startAt},
            ${endAt},
            'CONFIRMED'::"ReservationStatus",
            ${qrToken},
            ${referenceCode},
            ${contactNameTrim},
            ${phoneNorm},
            ${contactEmailSql},
            NOW(),
            NOW()
          )
          RETURNING "id", "qrToken", "referenceCode", "startAt", "endAt"
        `);

        const created = inserted[0];
        if (!created) {
          throw new Error('Не удалось сохранить бронь');
        }

        return {
          reservation: created,
          tableLabel: table.label,
          restaurantName: table.restaurant.name,
        };
      });

      return {
        id: reservation.reservation.id,
        qrToken: reservation.reservation.qrToken,
        referenceCode: reservation.reservation.referenceCode,
        startAt: reservation.reservation.startAt.toISOString(),
        endAt: reservation.reservation.endAt.toISOString(),
        tableLabel: reservation.tableLabel,
        restaurantName: reservation.restaurantName,
      };
    } catch (error) {
      lastError = error;
      if (isReferenceCodeCollision(error)) {
        // Unique collision on referenceCode — generate a new one and retry.
        continue;
      }
      throw error;
    }
  }

  // All retries exhausted — propagate last error with context.
  throw new Error(
    'Не удалось сгенерировать уникальный код брони. Попробуйте ещё раз.',
    { cause: lastError instanceof Error ? lastError : undefined },
  );
}
