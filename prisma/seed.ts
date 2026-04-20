import {
  PrismaClient,
  UserRole,
  ReservationStatus,
  TableShape,
  FloorPlanElementType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type TableInput = {
  label: string;
  capacity: number;
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isActive?: boolean;
};

type ElementInput = {
  type: FloorPlanElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  label?: string | null;
};

async function main() {
  const DEMO_PASSWORD = 'Demo12345!';
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Re-runnable for local demo/dev.
  await prisma.checkInLog.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.floorPlanElement.deleteMany();
  await prisma.floorPlan.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.restaurantAdmin.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ----------------------------------------------------------------

  // Top-tier MANAGER: platform operator / restaurant owner.
  // Can edit floor plans (drag&drop), assign hall admins, + everything hall admins can do.
  const managerUser = await prisma.user.create({
    data: {
      name: 'Platform Manager',
      email: 'manager@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-000-000',
      role: UserRole.MANAGER,
    },
  });

  // Hall ADMIN: scans QR, updates reservation statuses, scoped to specific restaurants.
  const adminUser = await prisma.user.create({
    data: {
      name: 'Hall Admin Alice',
      email: 'admin.alice@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-100-000',
      role: UserRole.ADMIN,
    },
  });

  const userBob = await prisma.user.create({
    data: {
      name: 'Bob Customer',
      email: 'bob@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-69-200-000',
      role: UserRole.USER,
    },
  });

  const userCarol = await prisma.user.create({
    data: {
      name: 'Carol Diner',
      email: 'carol@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-69-300-000',
      role: UserRole.USER,
    },
  });

  // --- Restaurants ---------------------------------------------------------

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

  // --- Floor plan builder helpers ------------------------------------------

  const createFloor = async (
    restaurantId: string,
    spec: {
      name: string;
      width: number;
      height: number;
      tables: TableInput[];
      elements?: ElementInput[];
    },
  ) => {
    const floor = await prisma.floorPlan.create({
      data: {
        restaurantId,
        name: spec.name,
        width: spec.width,
        height: spec.height,
        backgroundImageUrl: null,
      },
    });

    const tables = await Promise.all(
      spec.tables.map((t) =>
        prisma.restaurantTable.create({
          data: {
            restaurantId,
            floorPlanId: floor.id,
            label: t.label,
            capacity: t.capacity,
            shape: t.shape,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rotation: t.rotation ?? 0,
            isActive: t.isActive ?? true,
          },
        }),
      ),
    );

    if (spec.elements?.length) {
      await Promise.all(
        spec.elements.map((e) =>
          prisma.floorPlanElement.create({
            data: {
              floorPlanId: floor.id,
              type: e.type,
              x: e.x,
              y: e.y,
              width: e.width,
              height: e.height,
              rotation: e.rotation ?? 0,
              label: e.label ?? null,
            },
          }),
        ),
      );
    }

    return { floor, tables };
  };

  // --- Gastrobar: single floor — long bar counter along the right wall,
  //     high tables along the window, tight intimate tables in the center. --

  const gastrobarFloor = await createFloor(gastrobar.id, {
    name: 'Основной зал',
    width: 900,
    height: 620,
    tables: [
      // Bar stools along bar counter (right wall)
      { label: 'B1', capacity: 2, shape: TableShape.ROUND, x: 760, y: 80, width: 54, height: 54 },
      { label: 'B2', capacity: 2, shape: TableShape.ROUND, x: 760, y: 160, width: 54, height: 54 },
      { label: 'B3', capacity: 2, shape: TableShape.ROUND, x: 760, y: 240, width: 54, height: 54 },
      { label: 'B4', capacity: 2, shape: TableShape.ROUND, x: 760, y: 320, width: 54, height: 54 },
      { label: 'B5', capacity: 2, shape: TableShape.ROUND, x: 760, y: 400, width: 54, height: 54 },
      // Window high-tops along top
      { label: 'W1', capacity: 2, shape: TableShape.SQUARE, x: 80, y: 48, width: 70, height: 70 },
      { label: 'W2', capacity: 2, shape: TableShape.SQUARE, x: 200, y: 48, width: 70, height: 70 },
      { label: 'W3', capacity: 4, shape: TableShape.RECTANGLE, x: 310, y: 48, width: 150, height: 76 },
      // Main room center
      { label: 'M1', capacity: 4, shape: TableShape.ROUND, x: 120, y: 230, width: 90, height: 90 },
      { label: 'M2', capacity: 4, shape: TableShape.SQUARE, x: 290, y: 230, width: 90, height: 90 },
      { label: 'M3', capacity: 6, shape: TableShape.RECTANGLE, x: 440, y: 230, width: 200, height: 90 },
      // Banquet at bottom
      { label: 'P1', capacity: 8, shape: TableShape.RECTANGLE, x: 100, y: 440, width: 540, height: 100 },
    ],
    elements: [
      // Bar counter on right
      { type: FloorPlanElementType.BAR_COUNTER, x: 720, y: 40, width: 48, height: 480, label: 'Бар' },
      // Entrance (bottom right)
      { type: FloorPlanElementType.DOOR, x: 820, y: 540, width: 56, height: 48, label: null },
      // Windows along top edge
      { type: FloorPlanElementType.WINDOW, x: 60, y: 16, width: 180, height: 12, label: null },
      { type: FloorPlanElementType.WINDOW, x: 280, y: 16, width: 200, height: 12, label: null },
      // Restroom (bottom left)
      { type: FloorPlanElementType.RESTROOM, x: 40, y: 556, width: 70, height: 44, label: 'WC' },
      // Host stand near door
      { type: FloorPlanElementType.HOST_STAND, x: 700, y: 556, width: 70, height: 44 },
    ],
  });

  // --- Pegas: two floors — outdoor terrace + indoor dining hall -----------

  const pegasTerraceFloor = await createFloor(pegasTerrace.id, {
    name: 'Терраса',
    width: 820,
    height: 560,
    tables: [
      // Round umbrella tables in a 2x4 pattern
      { label: 'T1', capacity: 4, shape: TableShape.ROUND, x: 90, y: 80, width: 84, height: 84 },
      { label: 'T2', capacity: 4, shape: TableShape.ROUND, x: 240, y: 80, width: 84, height: 84 },
      { label: 'T3', capacity: 4, shape: TableShape.ROUND, x: 390, y: 80, width: 84, height: 84 },
      { label: 'T4', capacity: 4, shape: TableShape.ROUND, x: 540, y: 80, width: 84, height: 84 },
      { label: 'T5', capacity: 2, shape: TableShape.ROUND, x: 90, y: 230, width: 68, height: 68 },
      { label: 'T6', capacity: 2, shape: TableShape.ROUND, x: 240, y: 230, width: 68, height: 68 },
      { label: 'T7', capacity: 6, shape: TableShape.RECTANGLE, x: 380, y: 220, width: 210, height: 88 },
      // Family table at bottom
      { label: 'T8', capacity: 8, shape: TableShape.RECTANGLE, x: 120, y: 370, width: 480, height: 100 },
    ],
    elements: [
      // Railing along outer edge
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 30, width: 700, height: 8 },
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 520, width: 700, height: 8 },
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 30, width: 8, height: 500 },
      // Plants at corners
      { type: FloorPlanElementType.PLANT, x: 680, y: 70, width: 60, height: 60 },
      { type: FloorPlanElementType.PLANT, x: 680, y: 430, width: 60, height: 60 },
      // Door connecting to indoor hall (right side)
      { type: FloorPlanElementType.DOOR, x: 740, y: 250, width: 40, height: 60, label: 'В зал' },
    ],
  });

  const pegasIndoorFloor = await createFloor(pegasTerrace.id, {
    name: 'Обеденный зал',
    width: 820,
    height: 560,
    tables: [
      { label: 'H1', capacity: 2, shape: TableShape.SQUARE, x: 80, y: 80, width: 72, height: 72 },
      { label: 'H2', capacity: 2, shape: TableShape.SQUARE, x: 190, y: 80, width: 72, height: 72 },
      { label: 'H3', capacity: 4, shape: TableShape.ROUND, x: 320, y: 76, width: 88, height: 88 },
      { label: 'H4', capacity: 4, shape: TableShape.ROUND, x: 460, y: 76, width: 88, height: 88 },
      { label: 'H5', capacity: 6, shape: TableShape.RECTANGLE, x: 600, y: 70, width: 180, height: 100 },
      { label: 'H6', capacity: 4, shape: TableShape.SQUARE, x: 80, y: 260, width: 96, height: 96 },
      { label: 'H7', capacity: 4, shape: TableShape.SQUARE, x: 210, y: 260, width: 96, height: 96 },
      { label: 'H8', capacity: 6, shape: TableShape.RECTANGLE, x: 340, y: 260, width: 200, height: 96 },
      { label: 'H9', capacity: 8, shape: TableShape.RECTANGLE, x: 100, y: 420, width: 440, height: 100 },
    ],
    elements: [
      { type: FloorPlanElementType.DOOR, x: 40, y: 250, width: 40, height: 60, label: 'На террасу' },
      { type: FloorPlanElementType.KITCHEN, x: 600, y: 260, width: 180, height: 110, label: 'Кухня' },
      { type: FloorPlanElementType.RESTROOM, x: 600, y: 440, width: 90, height: 56, label: 'WC' },
      { type: FloorPlanElementType.HOST_STAND, x: 710, y: 440, width: 70, height: 56 },
    ],
  });

  // --- Smokehouse: BBQ pit in center, family benches around ---------------

  const smokehouseFloor = await createFloor(smokehouse.id, {
    name: 'Общий зал',
    width: 880,
    height: 640,
    tables: [
      // Two long communal benches flanking the smoker
      { label: 'L1', capacity: 10, shape: TableShape.RECTANGLE, x: 70, y: 120, width: 280, height: 90 },
      { label: 'L2', capacity: 10, shape: TableShape.RECTANGLE, x: 530, y: 120, width: 280, height: 90 },
      { label: 'L3', capacity: 10, shape: TableShape.RECTANGLE, x: 70, y: 430, width: 280, height: 90 },
      { label: 'L4', capacity: 10, shape: TableShape.RECTANGLE, x: 530, y: 430, width: 280, height: 90 },
      // 4-top corner tables
      { label: 'C1', capacity: 4, shape: TableShape.SQUARE, x: 70, y: 260, width: 90, height: 90 },
      { label: 'C2', capacity: 4, shape: TableShape.SQUARE, x: 720, y: 260, width: 90, height: 90 },
    ],
    elements: [
      // Smoker pit in exact center
      { type: FloorPlanElementType.SMOKER, x: 370, y: 270, width: 140, height: 120, label: 'Коптильня' },
      // Bar along the left wall
      { type: FloorPlanElementType.BAR_COUNTER, x: 20, y: 40, width: 40, height: 200, label: 'Бар' },
      // Entry/host
      { type: FloorPlanElementType.DOOR, x: 800, y: 580, width: 50, height: 48 },
      { type: FloorPlanElementType.HOST_STAND, x: 720, y: 580, width: 70, height: 48 },
      { type: FloorPlanElementType.RESTROOM, x: 30, y: 580, width: 80, height: 48, label: 'WC' },
      { type: FloorPlanElementType.KITCHEN, x: 600, y: 40, width: 240, height: 60, label: 'Кухня' },
    ],
  });

  // --- Àttico: two floors — 1st floor lounge with fireplace, 2nd floor terrace with railings --

  const atticoLoungeFloor = await createFloor(atticoTerrace.id, {
    name: 'Первый этаж · лаундж',
    width: 860,
    height: 600,
    tables: [
      { label: 'A1', capacity: 2, shape: TableShape.ROUND, x: 80, y: 100, width: 74, height: 74 },
      { label: 'A2', capacity: 2, shape: TableShape.ROUND, x: 200, y: 100, width: 74, height: 74 },
      { label: 'A3', capacity: 4, shape: TableShape.SQUARE, x: 90, y: 240, width: 92, height: 92 },
      { label: 'A4', capacity: 4, shape: TableShape.SQUARE, x: 220, y: 240, width: 92, height: 92 },
      { label: 'A5', capacity: 4, shape: TableShape.ROUND, x: 450, y: 190, width: 100, height: 100 },
      { label: 'A6', capacity: 6, shape: TableShape.RECTANGLE, x: 600, y: 160, width: 200, height: 100 },
      { label: 'A7', capacity: 8, shape: TableShape.RECTANGLE, x: 150, y: 430, width: 500, height: 100 },
    ],
    elements: [
      // Fireplace on the back wall
      { type: FloorPlanElementType.FIREPLACE, x: 600, y: 40, width: 180, height: 70, label: 'Камин' },
      // Stairs to terrace (right side)
      { type: FloorPlanElementType.STAIRS, x: 760, y: 320, width: 70, height: 180, label: 'На террасу' },
      { type: FloorPlanElementType.DOOR, x: 30, y: 540, width: 50, height: 44 },
      { type: FloorPlanElementType.HOST_STAND, x: 95, y: 540, width: 70, height: 44 },
      { type: FloorPlanElementType.RESTROOM, x: 700, y: 540, width: 120, height: 44, label: 'WC' },
    ],
  });

  const atticoTerraceFloor = await createFloor(atticoTerrace.id, {
    name: 'Терраса на крыше',
    width: 860,
    height: 600,
    tables: [
      { label: 'R1', capacity: 2, shape: TableShape.ROUND, x: 80, y: 100, width: 72, height: 72 },
      { label: 'R2', capacity: 2, shape: TableShape.ROUND, x: 200, y: 100, width: 72, height: 72 },
      { label: 'R3', capacity: 2, shape: TableShape.ROUND, x: 320, y: 100, width: 72, height: 72 },
      { label: 'R4', capacity: 4, shape: TableShape.ROUND, x: 470, y: 96, width: 92, height: 92 },
      { label: 'R5', capacity: 4, shape: TableShape.ROUND, x: 620, y: 96, width: 92, height: 92 },
      { label: 'R6', capacity: 6, shape: TableShape.RECTANGLE, x: 100, y: 300, width: 230, height: 90 },
      { label: 'R7', capacity: 6, shape: TableShape.RECTANGLE, x: 380, y: 300, width: 230, height: 90 },
      { label: 'R8', capacity: 8, shape: TableShape.RECTANGLE, x: 150, y: 450, width: 500, height: 100 },
    ],
    elements: [
      // Railing along the outer perimeter
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 40, width: 780, height: 8 },
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 560, width: 780, height: 8 },
      { type: FloorPlanElementType.TERRACE_RAILING, x: 40, y: 40, width: 8, height: 520 },
      { type: FloorPlanElementType.TERRACE_RAILING, x: 820, y: 40, width: 8, height: 520 },
      // Plants at corners
      { type: FloorPlanElementType.PLANT, x: 56, y: 200, width: 60, height: 60 },
      { type: FloorPlanElementType.PLANT, x: 740, y: 200, width: 60, height: 60 },
      { type: FloorPlanElementType.PLANT, x: 56, y: 430, width: 50, height: 50 },
      { type: FloorPlanElementType.PLANT, x: 750, y: 430, width: 50, height: 50 },
      // Stairs down
      { type: FloorPlanElementType.STAIRS, x: 760, y: 100, width: 70, height: 180, label: 'Вниз' },
    ],
  });

  // --- Garden: single floor — garden island plants and family tables ------

  const gardenFloor = await createFloor(gardenTerrace.id, {
    name: 'Садовый зал',
    width: 780,
    height: 560,
    tables: [
      { label: 'G1', capacity: 2, shape: TableShape.SQUARE, x: 80, y: 80, width: 72, height: 72 },
      { label: 'G2', capacity: 4, shape: TableShape.ROUND, x: 210, y: 76, width: 88, height: 88 },
      { label: 'G3', capacity: 4, shape: TableShape.ROUND, x: 360, y: 76, width: 88, height: 88 },
      { label: 'G4', capacity: 6, shape: TableShape.RECTANGLE, x: 510, y: 70, width: 200, height: 100 },
      { label: 'G5', capacity: 4, shape: TableShape.SQUARE, x: 80, y: 260, width: 92, height: 92 },
      { label: 'G6', capacity: 6, shape: TableShape.RECTANGLE, x: 210, y: 260, width: 220, height: 92 },
      { label: 'G7', capacity: 8, shape: TableShape.RECTANGLE, x: 100, y: 420, width: 580, height: 96 },
    ],
    elements: [
      // Garden island plants scattered
      { type: FloorPlanElementType.PLANT, x: 480, y: 240, width: 72, height: 72 },
      { type: FloorPlanElementType.PLANT, x: 600, y: 260, width: 60, height: 60 },
      { type: FloorPlanElementType.PLANT, x: 690, y: 260, width: 60, height: 60 },
      // Window wall along top
      { type: FloorPlanElementType.WINDOW, x: 60, y: 16, width: 640, height: 12 },
      { type: FloorPlanElementType.DOOR, x: 30, y: 500, width: 50, height: 44 },
      { type: FloorPlanElementType.HOST_STAND, x: 95, y: 500, width: 70, height: 44 },
      { type: FloorPlanElementType.KITCHEN, x: 540, y: 540, width: 220, height: 4, label: 'Кухня' },
    ],
  });

  // --- La Plăcinte: traditional with central wood-fired oven (FIREPLACE) --

  const laPlacinteFloor = await createFloor(laPlacinte.id, {
    name: 'Главный зал',
    width: 840,
    height: 580,
    tables: [
      // Rim of tables around the oven
      { label: 'O1', capacity: 2, shape: TableShape.SQUARE, x: 70, y: 80, width: 72, height: 72 },
      { label: 'O2', capacity: 4, shape: TableShape.ROUND, x: 190, y: 76, width: 86, height: 86 },
      { label: 'O3', capacity: 4, shape: TableShape.ROUND, x: 550, y: 76, width: 86, height: 86 },
      { label: 'O4', capacity: 2, shape: TableShape.SQUARE, x: 680, y: 80, width: 72, height: 72 },
      { label: 'O5', capacity: 4, shape: TableShape.SQUARE, x: 70, y: 260, width: 92, height: 92 },
      { label: 'O6', capacity: 4, shape: TableShape.SQUARE, x: 680, y: 260, width: 92, height: 92 },
      // Family long tables
      { label: 'F1', capacity: 8, shape: TableShape.RECTANGLE, x: 110, y: 420, width: 260, height: 100 },
      { label: 'F2', capacity: 8, shape: TableShape.RECTANGLE, x: 460, y: 420, width: 260, height: 100 },
    ],
    elements: [
      // Wood-fired oven in center
      { type: FloorPlanElementType.FIREPLACE, x: 330, y: 220, width: 180, height: 140, label: 'Печь' },
      { type: FloorPlanElementType.BAR_COUNTER, x: 300, y: 30, width: 240, height: 40, label: 'Бар' },
      { type: FloorPlanElementType.DOOR, x: 30, y: 520, width: 50, height: 44 },
      { type: FloorPlanElementType.HOST_STAND, x: 90, y: 520, width: 70, height: 44 },
      { type: FloorPlanElementType.RESTROOM, x: 700, y: 520, width: 100, height: 44, label: 'WC' },
    ],
  });

  // --- Working hours (7 days, all 6 restaurants) ---------------------------

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

  // --- Admin-restaurant links: ADMIN + MANAGER both linked to all 6 -------
  // Higher role inherits all lower perms, so MANAGER also has per-restaurant admin access.
  await Promise.all([
    ...restaurantsForHours.map((restaurant) =>
      prisma.restaurantAdmin.create({
        data: { userId: adminUser.id, restaurantId: restaurant.id },
      }),
    ),
    ...restaurantsForHours.map((restaurant) =>
      prisma.restaurantAdmin.create({
        data: { userId: managerUser.id, restaurantId: restaurant.id },
      }),
    ),
  ]);

  // --- Demo reservations ---------------------------------------------------

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const startOfWindow = (hour: number) => {
    const dt = new Date(tomorrow);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };
  const withDuration = (startAt: Date, minutes: number) =>
    new Date(startAt.getTime() + minutes * 60 * 1000);

  const reservationDurationMinutes = 90;

  await Promise.all([
    prisma.reservation.create({
      data: {
        userId: userBob.id,
        restaurantId: gastrobar.id,
        tableId: gastrobarFloor.tables[5].id,
        guestCount: 2,
        startAt: startOfWindow(19),
        endAt: withDuration(startOfWindow(19), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_gastrobar_1',
        referenceCode: '7000001',
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
        tableId: pegasTerraceFloor.tables[2].id,
        guestCount: 4,
        startAt: startOfWindow(20),
        endAt: withDuration(startOfWindow(20), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_pegas_1',
        referenceCode: '7000002',
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
        tableId: smokehouseFloor.tables[0].id,
        guestCount: 8,
        startAt: startOfWindow(18),
        endAt: withDuration(startOfWindow(18), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_smokehouse_1',
        referenceCode: '7000003',
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
        tableId: atticoTerraceFloor.tables[3].id,
        guestCount: 4,
        startAt: startOfWindow(19),
        endAt: withDuration(startOfWindow(19), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_attico_1',
        referenceCode: '7000004',
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
        tableId: gardenFloor.tables[2].id,
        guestCount: 4,
        startAt: startOfWindow(20),
        endAt: withDuration(startOfWindow(20), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_garden_1',
        referenceCode: '7000005',
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
        tableId: laPlacinteFloor.tables[6].id,
        guestCount: 6,
        startAt: startOfWindow(18),
        endAt: withDuration(startOfWindow(18), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_la_placinte_1',
        referenceCode: '7000006',
        contactName: 'Carol Diner',
        contactPhone: userCarol.phone,
        contactEmail: userCarol.email,
        notes: 'Demo reservation for QR check-in.',
      },
    }),
  ]);

  // Discourage unused-variable warnings from TS when the floor handles
  // are used only for typed referencing.
  void pegasIndoorFloor;
  void atticoLoungeFloor;
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
