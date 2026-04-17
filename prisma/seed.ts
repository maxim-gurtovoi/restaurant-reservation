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
        'Авторские коктейли и сезонные закуски в тёплом оживлённом баре Кишинёва. Подойдёт для неспешного ужина с друзьями.',
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
        'Светлая терраса, внимательный сервис и блюда на компанию. Для долгих ланчей, спокойных разговоров и тёплых кишинёвских вечеров.',
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
        'Мясо низкой коптильни, фирменные соусы BBQ и сытные гарниры. Для любителей насыщенного дымного вкуса и больших порций.',
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
        'Ужин на террасе на крыше: современные средиземноморские блюда и изящные коктейли. Для свиданий и особых случаев.',
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
        'Кухня в духе сада на основе свежих сезонных продуктов. Светлый уютный зал для семейных ужинов и неспешных встреч.',
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
        'Традиционная молдавская кухня с современным акцентом. Известны домашние пироги, местные блюда и уютная атмосфера.',
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
  const gastroFloor = await createFloorPlan(gastrobar.id, 'Основной зал', 900, 620);
  const pegasFloor = await createFloorPlan(pegasTerrace.id, 'Терраса', 820, 560);
  const smokeFloor = await createFloorPlan(smokehouse.id, 'Обеденный зал', 880, 640);
  const atticoFloor = await createFloorPlan(atticoTerrace.id, 'Терраса', 860, 600);
  const gardenFloor = await createFloorPlan(gardenTerrace.id, 'Садовый зал', 780, 560);
  const laPlacinteFloor = await createFloorPlan(laPlacinte.id, 'Основной зал', 840, 580);

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
      { x: 70, y: 72, w: 58, h: 58 },
      { x: 150, y: 72, w: 168, h: 72 },
      { x: 338, y: 72, w: 86, h: 86 },
      { x: 444, y: 72, w: 72, h: 72 },
      { x: 100, y: 360, w: 520, h: 84 },
    ],
  });

  const pegasTables = await createTablesForFloor({
    restaurantId: pegasTerrace.id,
    floorPlanId: pegasFloor.id,
    labels: ['P1', 'P2', 'P3', 'P4'],
    capacities: [2, 4, 4, 6],
    shapes: [TableShape.RECTANGLE, TableShape.ROUND, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 56, y: 76, w: 125, h: 64 },
      { x: 201, y: 76, w: 74, h: 74 },
      { x: 283, y: 76, w: 88, h: 88 },
      { x: 56, y: 340, w: 490, h: 78 },
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
      { x: 52, y: 78, w: 60, h: 60 },
      { x: 128, y: 76, w: 175, h: 72 },
      { x: 323, y: 78, w: 72, h: 72 },
      { x: 415, y: 76, w: 95, h: 95 },
      { x: 72, y: 360, w: 510, h: 86 },
    ],
  });

  const atticoTables = await createTablesForFloor({
    restaurantId: atticoTerrace.id,
    floorPlanId: atticoFloor.id,
    labels: ['A1', 'A2', 'A3', 'A4'],
    capacities: [2, 4, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 58, y: 78, w: 64, h: 64 },
      { x: 138, y: 74, w: 228, h: 74 },
      { x: 384, y: 76, w: 92, h: 92 },
      { x: 58, y: 340, w: 530, h: 76 },
    ],
  });

  const gardenTables = await createTablesForFloor({
    restaurantId: gardenTerrace.id,
    floorPlanId: gardenFloor.id,
    labels: ['D1', 'D2', 'D3'],
    capacities: [2, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.RECTANGLE],
    layout: [
      { x: 58, y: 82, w: 62, h: 62 },
      { x: 132, y: 76, w: 188, h: 72 },
      { x: 58, y: 352, w: 470, h: 84 },
    ],
  });

  const laPlacinteTables = await createTablesForFloor({
    restaurantId: laPlacinte.id,
    floorPlanId: laPlacinteFloor.id,
    labels: ['L1', 'L2', 'L3', 'L4'],
    capacities: [2, 4, 4, 6],
    shapes: [TableShape.ROUND, TableShape.RECTANGLE, TableShape.SQUARE, TableShape.RECTANGLE],
    layout: [
      { x: 64, y: 82, w: 58, h: 58 },
      { x: 140, y: 76, w: 195, h: 72 },
      { x: 355, y: 74, w: 100, h: 100 },
      { x: 62, y: 360, w: 510, h: 82 },
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

