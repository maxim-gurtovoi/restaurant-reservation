import { PrismaClient, UserRole, ReservationStatus, TableShape, CheckInMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'hashed-password-admin',
      phone: '+1-555-000-0000',
      role: UserRole.ADMIN,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Manager Alice',
      email: 'manager.alice@example.com',
      passwordHash: 'hashed-password-manager',
      phone: '+1-555-100-0000',
      role: UserRole.MANAGER,
    },
  });

  const userBob = await prisma.user.create({
    data: {
      name: 'Bob Customer',
      email: 'bob@example.com',
      passwordHash: 'hashed-password-bob',
      phone: '+1-555-200-0000',
      role: UserRole.USER,
    },
  });

  const userCarol = await prisma.user.create({
    data: {
      name: 'Carol Diner',
      email: 'carol@example.com',
      passwordHash: 'hashed-password-carol',
      phone: '+1-555-300-0000',
      role: UserRole.USER,
    },
  });

  // Restaurants
  const oceanBreeze = await prisma.restaurant.create({
    data: {
      name: 'Ocean Breeze',
      slug: 'ocean-breeze',
      description: 'Seafood restaurant with ocean-view terrace.',
      address: '123 Seaside Avenue, Lisbon',
      phone: '+351-21-000-000',
      email: 'contact@ocean-breeze.example.com',
      imageUrl: 'https://example.com/images/ocean-breeze.jpg',
      isActive: true,
    },
  });

  const urbanGrill = await prisma.restaurant.create({
    data: {
      name: 'Urban Grill',
      slug: 'urban-grill',
      description: 'Modern grill in the heart of the city.',
      address: '45 Central Street, Berlin',
      phone: '+49-30-000-000',
      email: 'hello@urban-grill.example.com',
      imageUrl: 'https://example.com/images/urban-grill.jpg',
      isActive: true,
    },
  });

  // Floor plans
  const oceanFloor = await prisma.floorPlan.create({
    data: {
      restaurantId: oceanBreeze.id,
      name: 'Main Hall',
      width: 800,
      height: 600,
      backgroundImageUrl: null,
    },
  });

  const urbanFloor = await prisma.floorPlan.create({
    data: {
      restaurantId: urbanGrill.id,
      name: 'Ground Floor',
      width: 900,
      height: 650,
      backgroundImageUrl: null,
    },
  });

  // Tables for Ocean Breeze (6 tables)
  const oceanTables = await Promise.all([
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T1',
        capacity: 2,
        shape: TableShape.ROUND,
        x: 80,
        y: 100,
        width: 60,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T2',
        capacity: 4,
        shape: TableShape.RECTANGLE,
        x: 200,
        y: 120,
        width: 100,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T3',
        capacity: 4,
        shape: TableShape.SQUARE,
        x: 350,
        y: 140,
        width: 80,
        height: 80,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T4',
        capacity: 6,
        shape: TableShape.RECTANGLE,
        x: 120,
        y: 260,
        width: 140,
        height: 70,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T5',
        capacity: 2,
        shape: TableShape.ROUND,
        x: 300,
        y: 280,
        width: 60,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: oceanBreeze.id,
        floorPlanId: oceanFloor.id,
        label: 'T6',
        capacity: 4,
        shape: TableShape.SQUARE,
        x: 460,
        y: 220,
        width: 80,
        height: 80,
        rotation: 0,
        isActive: true,
      },
    }),
  ]);

  // Tables for Urban Grill (6 tables)
  const urbanTables = await Promise.all([
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'A1',
        capacity: 2,
        shape: TableShape.ROUND,
        x: 90,
        y: 110,
        width: 60,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'A2',
        capacity: 4,
        shape: TableShape.RECTANGLE,
        x: 230,
        y: 130,
        width: 100,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'A3',
        capacity: 4,
        shape: TableShape.SQUARE,
        x: 380,
        y: 150,
        width: 80,
        height: 80,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'B1',
        capacity: 6,
        shape: TableShape.RECTANGLE,
        x: 140,
        y: 270,
        width: 140,
        height: 70,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'B2',
        capacity: 2,
        shape: TableShape.ROUND,
        x: 320,
        y: 290,
        width: 60,
        height: 60,
        rotation: 0,
        isActive: true,
      },
    }),
    prisma.restaurantTable.create({
      data: {
        restaurantId: urbanGrill.id,
        floorPlanId: urbanFloor.id,
        label: 'B3',
        capacity: 4,
        shape: TableShape.SQUARE,
        x: 480,
        y: 230,
        width: 80,
        height: 80,
        rotation: 0,
        isActive: true,
      },
    }),
  ]);

  // Working hours (10:00–22:00, 7 days) for both restaurants
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];

  await Promise.all(
    daysOfWeek.flatMap((day) => [
      prisma.workingHours.create({
        data: {
          restaurantId: oceanBreeze.id,
          dayOfWeek: day,
          openTime: '10:00',
          closeTime: '22:00',
          isClosed: false,
        },
      }),
      prisma.workingHours.create({
        data: {
          restaurantId: urbanGrill.id,
          dayOfWeek: day,
          openTime: '11:00',
          closeTime: '23:00',
          isClosed: false,
        },
      }),
    ]),
  );

  // Restaurant manager link (managerUser -> Ocean Breeze)
  await prisma.restaurantManager.create({
    data: {
      userId: managerUser.id,
      restaurantId: oceanBreeze.id,
    },
  });

  // Reservations
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const reservation1 = await prisma.reservation.create({
    data: {
      userId: userBob.id,
      restaurantId: oceanBreeze.id,
      tableId: oceanTables[1].id,
      guestCount: 2,
      startAt: new Date(tomorrow.setHours(19, 0, 0, 0)),
      endAt: new Date(tomorrow.setHours(21, 0, 0, 0)),
      status: ReservationStatus.CONFIRMED,
      qrToken: 'qr_ocean_breeze_res_1',
      contactName: 'Bob Customer',
      contactPhone: userBob.phone,
      contactEmail: userBob.email,
      notes: 'Window seat if possible.',
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      userId: userCarol.id,
      restaurantId: oceanBreeze.id,
      tableId: oceanTables[3].id,
      guestCount: 4,
      startAt: new Date(dayAfterTomorrow.setHours(20, 0, 0, 0)),
      endAt: new Date(dayAfterTomorrow.setHours(22, 0, 0, 0)),
      status: ReservationStatus.CANCELLED,
      qrToken: 'qr_ocean_breeze_res_2',
      contactName: 'Carol Diner',
      contactPhone: userCarol.phone,
      contactEmail: userCarol.email,
      notes: 'Birthday dinner.',
      cancelledAt: new Date(),
    },
  });

  const reservation3 = await prisma.reservation.create({
    data: {
      userId: userBob.id,
      restaurantId: urbanGrill.id,
      tableId: urbanTables[0].id,
      guestCount: 2,
      startAt: new Date(now.setHours(now.getHours() - 2)),
      endAt: new Date(now.setHours(now.getHours() - 1)),
      status: ReservationStatus.CHECKED_IN,
      qrToken: 'qr_urban_grill_res_1',
      contactName: 'Bob Customer',
      contactPhone: userBob.phone,
      contactEmail: userBob.email,
      notes: null,
      checkedInAt: new Date(),
    },
  });

  // Check-in log for reservation3 by manager
  await prisma.checkInLog.create({
    data: {
      reservationId: reservation3.id,
      checkedInByUserId: managerUser.id,
      checkedInAt: new Date(),
      method: CheckInMethod.QR,
      notes: 'Checked in via QR at entrance.',
    },
  });

  // A completed reservation
  await prisma.reservation.create({
    data: {
      userId: userCarol.id,
      restaurantId: urbanGrill.id,
      tableId: urbanTables[2].id,
      guestCount: 3,
      startAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: ReservationStatus.COMPLETED,
      qrToken: 'qr_urban_grill_res_2',
      contactName: 'Carol Diner',
      contactPhone: userCarol.phone,
      contactEmail: userCarol.email,
      notes: 'Celebration dinner.',
    },
  });

  // A no-show reservation
  await prisma.reservation.create({
    data: {
      userId: userBob.id,
      restaurantId: oceanBreeze.id,
      tableId: oceanTables[5].id,
      guestCount: 2,
      startAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      status: ReservationStatus.NO_SHOW,
      qrToken: 'qr_ocean_breeze_res_3',
      contactName: 'Bob Customer',
      contactPhone: userBob.phone,
      contactEmail: userBob.email,
      notes: 'Customer did not show up.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

