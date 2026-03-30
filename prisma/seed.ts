import { PrismaClient, UserRole, ReservationStatus, TableShape, CheckInMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const DEMO_PASSWORD = 'Demo12345!';
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Make seed re-runnable for local demo/dev.
  await prisma.checkInLog.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.floorPlan.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.restaurantManager.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: demoPasswordHash,
      phone: '+1-555-000-0000',
      role: UserRole.ADMIN,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Manager Alice',
      email: 'manager.alice@example.com',
      passwordHash: demoPasswordHash,
      phone: '+1-555-100-0000',
      role: UserRole.MANAGER,
    },
  });

  const userBob = await prisma.user.create({
    data: {
      name: 'Bob Customer',
      email: 'bob@example.com',
      passwordHash: demoPasswordHash,
      phone: '+1-555-200-0000',
      role: UserRole.USER,
    },
  });

  const userCarol = await prisma.user.create({
    data: {
      name: 'Carol Diner',
      email: 'carol@example.com',
      passwordHash: demoPasswordHash,
      phone: '+1-555-300-0000',
      role: UserRole.USER,
    },
  });

  // Restaurants (Chișinău only)
  const gastrobar = await prisma.restaurant.create({
    data: {
      name: 'Gastrobar',
      slug: 'gastrobar',
      description:
        'House-made cocktails and seasonal small plates in a warm, lively Chișinău bar. A great choice for an unhurried dinner with friends.',
      address: 'Str. Alexandru Bernardazzi 66, Chișinău',
      imageUrl: '/images/restaurants/gastrobar.png',
      isActive: true,
    },
  });

  const pegasTerrace = await prisma.restaurant.create({
    data: {
      name: 'Pegas Terrace & Restaurant',
      slug: 'pegas-terrace-restaurant',
      description:
        'A bright terrace with attentive service and shareable plates. Designed for long lunches, calm conversations, and warm Chișinău evenings.',
      address: 'Str. Albișoara 20/1, Chișinău',
      imageUrl: '/images/restaurants/pegas.png',
      isActive: true,
    },
  });

  const smokehouse = await prisma.restaurant.create({
    data: {
      name: 'Smokehouse',
      slug: 'smokehouse',
      description:
        'Slow-smoked meats, signature barbecue sauces, and hearty sides. For guests who like bold, smoky flavors and generous portions.',
      address: 'Bd. Ștefan cel Mare și Sfînt 128, Chișinău',
      imageUrl: '/images/restaurants/smokehouse.png',
      isActive: true,
    },
  });

  const atticoTerrace = await prisma.restaurant.create({
    data: {
      name: 'Àttico Terrace & Restaurant',
      slug: 'attico-terrace-restaurant',
      description:
        'Rooftop terrace dining with modern Mediterranean plates and elegant cocktails. Ideal for date nights and memorable celebrations.',
      address: 'Str. Nicolae Dimo 32, Chișinău',
      imageUrl: '/images/restaurants/attico.png',
      isActive: true,
    },
  });

  const gardenTerrace = await prisma.restaurant.create({
    data: {
      name: 'Garden Restaurant & Terrace',
      slug: 'garden-restaurant-terrace',
      description:
        'Garden-inspired cuisine built around fresh, seasonal ingredients. Bright, comfortable seating for family dinners and relaxed gatherings.',
      address: 'Strada Vasile Alecsandri 8, Chișinău',
      imageUrl: '/images/restaurants/garden.png',
      isActive: true,
    },
  });

  const laPlacinte = await prisma.restaurant.create({
    data: {
      name: 'La Plăcinte',
      slug: 'la-placinte-stefan-cel-mare',
      description:
        'Traditional Moldovan cuisine with a modern touch. Famous for homemade pies, local dishes, and a cozy atmosphere.',
      address: 'Chișinău, Bulevardul Ștefan cel Mare și Sfânt 182',
      imageUrl: '/images/restaurants/la-placinte.png',
      isActive: true,
    },
  });

  const createFloorPlan = async (
    restaurantId: string,
    name: string,
    width: number,
    height: number,
  ) => {
    return prisma.floorPlan.create({
      data: {
        restaurantId,
        name,
        width,
        height,
        backgroundImageUrl: null,
      },
    });
  };

  // Floor plans
  const gastroFloor = await createFloorPlan(gastrobar.id, 'Main hall', 900, 620);
  const pegasFloor = await createFloorPlan(pegasTerrace.id, 'Terrace', 820, 560);
  const smokeFloor = await createFloorPlan(smokehouse.id, 'Dining room', 880, 640);
  const atticoFloor = await createFloorPlan(atticoTerrace.id, 'Terrace', 860, 600);
  const gardenFloor = await createFloorPlan(gardenTerrace.id, 'Garden room', 780, 560);
  const laPlacinteFloor = await createFloorPlan(laPlacinte.id, 'Main hall', 840, 580);

  const createTablesForFloor = async (args: {
    restaurantId: string;
    floorPlanId: string;
    labels: string[];
    capacities: number[];
    shapes: TableShape[];
    layout: { x: number; y: number; w: number; h: number; r?: number }[];
  }) => {
    const created = await Promise.all(
      args.labels.map((label, i) => {
        const pos = args.layout[i];
        return prisma.restaurantTable.create({
          data: {
            restaurantId: args.restaurantId,
            floorPlanId: args.floorPlanId,
            label,
            capacity: args.capacities[i],
            shape: args.shapes[i],
            x: pos.x,
            y: pos.y,
            width: pos.w,
            height: pos.h,
            rotation: pos.r ?? 0,
            isActive: true,
          },
        });
      }),
    );
    return created;
  };

  // Tables: keep a small but varied set for demo
  const gastroTables = await createTablesForFloor({
    restaurantId: gastrobar.id,
    floorPlanId: gastroFloor.id,
    labels: ['G1', 'G2', 'G3', 'G4', 'G5'],
    capacities: [2, 4, 2, 4, 6],
    shapes: [
      TableShape.ROUND,
      TableShape.RECTANGLE,
      TableShape.SQUARE,
      TableShape.ROUND,
      TableShape.RECTANGLE,
    ],
    layout: [
      { x: 120, y: 115, w: 72, h: 72 },
      { x: 220, y: 105, w: 150, h: 72, r: -8 },
      { x: 410, y: 130, w: 92, h: 92 },
      { x: 525, y: 120, w: 74, h: 74, r: 6 },
      { x: 170, y: 300, w: 330, h: 90 },
    ],
  });

  const pegasTables = await createTablesForFloor({
    restaurantId: pegasTerrace.id,
    floorPlanId: pegasFloor.id,
    labels: ['P1', 'P2', 'P3', 'P4'],
    capacities: [2, 3, 4, 6],
    shapes: [TableShape.RECTANGLE, TableShape.ROUND, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 140, y: 120, w: 140, h: 72, r: 8 },
      { x: 320, y: 135, w: 82, h: 82 },
      { x: 430, y: 105, w: 140, h: 140, r: -4 },
      { x: 190, y: 300, w: 300, h: 82, r: -6 },
    ],
  });

  const smokeTables = await createTablesForFloor({
    restaurantId: smokehouse.id,
    floorPlanId: smokeFloor.id,
    labels: ['S1', 'S2', 'S3', 'S4', 'S5'],
    capacities: [2, 4, 2, 4, 6],
    shapes: [
      TableShape.ROUND,
      TableShape.RECTANGLE,
      TableShape.ROUND,
      TableShape.SQUARE,
      TableShape.RECTANGLE,
    ],
    layout: [
      { x: 115, y: 125, w: 74, h: 74 },
      { x: 215, y: 110, w: 165, h: 72, r: 10 },
      { x: 440, y: 130, w: 92, h: 92, r: -6 },
      { x: 570, y: 115, w: 125, h: 125 },
      { x: 150, y: 315, w: 380, h: 90, r: 4 },
    ],
  });

  const atticoTables = await createTablesForFloor({
    restaurantId: atticoTerrace.id,
    floorPlanId: atticoFloor.id,
    labels: ['A1', 'A2', 'A3', 'A4'],
    capacities: [2, 4, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 145, y: 115, w: 78, h: 78 },
      { x: 255, y: 95, w: 210, h: 78, r: -12 },
      { x: 490, y: 135, w: 94, h: 94 },
      { x: 255, y: 310, w: 320, h: 78 },
    ],
  });

  const gardenTables = await createTablesForFloor({
    restaurantId: gardenTerrace.id,
    floorPlanId: gardenFloor.id,
    labels: ['D1', 'D2', 'D3'],
    capacities: [2, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.SQUARE],
    layout: [
      { x: 140, y: 125, w: 82, h: 82 },
      { x: 270, y: 110, w: 170, h: 78, r: 6 },
      { x: 475, y: 140, w: 128, h: 128 },
    ],
  });

  const laPlacinteTables = await createTablesForFloor({
    restaurantId: laPlacinte.id,
    floorPlanId: laPlacinteFloor.id,
    labels: ['L1', 'L2', 'L3', 'L4'],
    capacities: [2, 4, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 130, y: 115, w: 78, h: 78 },
      { x: 250, y: 105, w: 185, h: 78, r: -5 },
      { x: 470, y: 130, w: 110, h: 110 },
      { x: 220, y: 300, w: 310, h: 82, r: 4 },
    ],
  });

  // Working hours (plausible demo times, 7 days)
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
  const restaurantsForHours = [
    gastrobar,
    pegasTerrace,
    smokehouse,
    atticoTerrace,
    gardenTerrace,
    laPlacinte,
  ];

  await Promise.all(
    daysOfWeek.flatMap((day) =>
      restaurantsForHours.map((restaurant) =>
        prisma.workingHours.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek: day,
            openTime: '11:00',
            closeTime: '23:00',
            isClosed: false,
          },
        }),
      ),
    ),
  );

  // Restaurant manager link (manager -> all 6 restaurants)
  await Promise.all(
    restaurantsForHours.map((restaurant) =>
      prisma.restaurantManager.create({
        data: {
          userId: managerUser.id,
          restaurantId: restaurant.id,
        },
      }),
    ),
  );

  // Reservations (seed CONFIRMED for demo/QR)
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startOfWindow = (minutesOffsetHours: number) => {
    const dt = new Date(tomorrow);
    dt.setHours(minutesOffsetHours, 0, 0, 0);
    return dt;
  };
  const withDuration = (startAt: Date, minutes: number) => {
    return new Date(startAt.getTime() + minutes * 60 * 1000);
  };

  const reservationDurationMinutes = 90;

  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: gastrobar.id,
        tableId: gastroTables[1].id,
        guestCount: 2,
        startAt: startOfWindow(19),
        endAt: withDuration(startOfWindow(19), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_gastrobar_1',
        contactName: 'Bob Customer',
        contactPhone: userBob.phone,
        contactEmail: userBob.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: pegasTerrace.id,
        tableId: pegasTables[2].id,
        guestCount: 4,
        startAt: startOfWindow(20),
        endAt: withDuration(startOfWindow(20), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_pegas_1',
        contactName: 'Bob Customer',
        contactPhone: userBob.phone,
        contactEmail: userBob.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: smokehouse.id,
        tableId: smokeTables[0].id,
        guestCount: 2,
        startAt: startOfWindow(18),
        endAt: withDuration(startOfWindow(18), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_smokehouse_1',
        contactName: 'Bob Customer',
        contactPhone: userBob.phone,
        contactEmail: userBob.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: atticoTerrace.id,
        tableId: atticoTables[3].id,
        guestCount: 6,
        startAt: startOfWindow(19),
        endAt: withDuration(startOfWindow(19), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_attico_1',
        contactName: 'Bob Customer',
        contactPhone: userBob.phone,
        contactEmail: userBob.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: gardenTerrace.id,
        tableId: gardenTables[1].id,
        guestCount: 4,
        startAt: startOfWindow(20),
        endAt: withDuration(startOfWindow(20), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_garden_1',
        contactName: 'Bob Customer',
        contactPhone: userBob.phone,
        contactEmail: userBob.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
    prisma.reservation.create({
      data: {
        userId: userCarol.id,
        restaurantId: laPlacinte.id,
        tableId: laPlacinteTables[2].id,
        guestCount: 4,
        startAt: startOfWindow(18),
        endAt: withDuration(startOfWindow(18), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_la_placinte_1',
        contactName: 'Carol Diner',
        contactPhone: userCarol.phone,
        contactEmail: userCarol.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
  ]);

  void reservations;
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

