import {
  PrismaClient,
  UserRole,
  ReservationStatus,
  TableShape,
  FloorPlanElementType,
  RestaurantFeature,
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

  // Владелец платформы (OWNER): создание ресторанов, глобальный обзор в /manager.
  const ownerUser = await prisma.user.create({
    data: {
      name: 'Владелец платформы',
      email: 'owner@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-000-001',
      role: UserRole.OWNER,
    },
  });

  // Управляющий Gastrobar (MANAGER): один ресторан через Restaurant.managerUserId.
  const managerUser = await prisma.user.create({
    data: {
      name: 'Управляющий Gastrobar',
      email: 'manager.gastrobar@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-000-000',
      role: UserRole.MANAGER,
    },
  });

  // Два администратора зала (ADMIN) — только Gastrobar (демо изоляции по ресторанам).
  const adminUser1 = await prisma.user.create({
    data: {
      name: 'Админ зала 1 (Gastrobar)',
      email: 'admin1.gastrobar@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-100-001',
      role: UserRole.ADMIN,
    },
  });

  const adminUser2 = await prisma.user.create({
    data: {
      name: 'Админ зала 2 (Gastrobar)',
      email: 'admin2.gastrobar@example.com',
      passwordHash: demoPasswordHash,
      phone: '+373-22-100-002',
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
      phone: '+373 68 906 545',
      email: 'resta2014@list.ru',
      imageUrl: '/images/restaurants/gastrobar.png',
      coverImageUrl: '/images/restaurants/gastrobar/cover.png',
      cuisine: 'Гастробар · Авторская',
      priceLevel: 3,
      websiteUrl: null,
      instagramUrl: 'https://www.instagram.com/gastrobarlivekitchen/',
      facebookUrl: 'https://www.facebook.com/GastrobarLiveKitchen/',
      googleMapsUrl: 'https://www.google.com/maps/place/Gastrobar/@47.0244,28.8294,17z',
      rating: 4.6,
      reviewsCount: 284,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.WIFI,
        RestaurantFeature.RESERVATIONS,
        RestaurantFeature.LIVE_MUSIC,
        RestaurantFeature.TAKEAWAY,
      ],
      isActive: true,
      managerUserId: managerUser.id,
    },
  });

  const pegasTerrace = await prisma.restaurant.create({
    data: {
      name: 'Pegas Terrace & Restaurant',
      slug: 'pegas-terrace-restaurant',
      description:
        'Светлая терраса, внимательный сервис и блюда на компанию. Для долгих ланчей, спокойных разговоров и тёплых кишинёвских вечеров.',
      address: 'Str. Albișoara 20/1, Chișinău',
      phone: '+373 78 800 600',
      email: 'pegas_md@mail.ru',
      imageUrl: '/images/restaurants/pegas.png',
      coverImageUrl: '/images/restaurants/pegas-terrace-restaurant/1.png',
      cuisine: 'Европейская',
      priceLevel: 2,
      websiteUrl: 'https://pegasrestaurant.md',
      instagramUrl: null,
      facebookUrl: 'https://www.facebook.com/pegasrestaurant/',
      googleMapsUrl: 'https://www.google.com/maps/place/Pegas/@47.0334,28.8369,17z',
      rating: 4.4,
      reviewsCount: 512,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.TERRACE,
        RestaurantFeature.PARKING,
        RestaurantFeature.WIFI,
        RestaurantFeature.FAMILY_FRIENDLY,
        RestaurantFeature.RESERVATIONS,
      ],
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
      phone: '+373 60 619 777',
      email: 'bbq@smokehouse.md',
      imageUrl: '/images/restaurants/smokehouse.png',
      coverImageUrl: '/images/restaurants/smokehouse/1.png',
      cuisine: 'BBQ · Американская',
      priceLevel: 3,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: 'https://www.facebook.com/Smokehouse.Moldova',
      googleMapsUrl: 'https://www.google.com/maps/place/Smokehouse/@47.0245,28.8348,17z',
      rating: 4.7,
      reviewsCount: 693,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.TAKEAWAY,
        RestaurantFeature.DELIVERY,
        RestaurantFeature.WIFI,
        RestaurantFeature.RESERVATIONS,
        RestaurantFeature.FAMILY_FRIENDLY,
      ],
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
      phone: '+373 68 454 555',
      email: 'atticorestaurant@gmail.com',
      imageUrl: '/images/restaurants/attico.png',
      coverImageUrl: '/images/restaurants/attico-terrace-restaurant/1.png',
      cuisine: 'Средиземноморская',
      priceLevel: 4,
      websiteUrl: null,
      instagramUrl: 'https://www.instagram.com/attico.terrace.restaurant/',
      facebookUrl: 'https://www.facebook.com/AtticoTerraceRestaurant/',
      googleMapsUrl: 'https://www.google.com/maps/place/Attico+Terrace+%26+Restaurant/@47.0628,28.8851,17z',
      rating: 4.8,
      reviewsCount: 421,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.TERRACE,
        RestaurantFeature.LIVE_MUSIC,
        RestaurantFeature.WIFI,
        RestaurantFeature.RESERVATIONS,
        RestaurantFeature.PARKING,
      ],
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
      phone: '+373 79 803 803',
      email: 'office@gardenpalace.md',
      imageUrl: '/images/restaurants/garden.png',
      coverImageUrl: '/images/restaurants/garden-restaurant-terrace/1.png',
      cuisine: 'Европейская · Fresh',
      priceLevel: 2,
      websiteUrl: 'https://gardenpalace.md',
      instagramUrl: null,
      facebookUrl: 'https://www.facebook.com/Garden.Palace.restaurant/',
      googleMapsUrl: 'https://www.google.com/maps/place/Garden+Palace+Events+Restaurant/@47.0260,28.8260,17z',
      rating: 4.5,
      reviewsCount: 348,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.TERRACE,
        RestaurantFeature.PET_FRIENDLY,
        RestaurantFeature.FAMILY_FRIENDLY,
        RestaurantFeature.WIFI,
        RestaurantFeature.RESERVATIONS,
      ],
      isActive: true,
    },
  });

  const laPlacinte = await prisma.restaurant.create({
    data: {
      name: 'La Plăcinte',
      slug: 'la-placinte-stefan-cel-mare',
      description:
        'Традиционная молдавская кухня с современным акцентом. Известны домашние пироги, местные блюда и уютная атмосфера.',
      address: 'Bd. Ștefan cel Mare și Sfînt 3, Chișinău',
      phone: '+373 60 777 633',
      email: 'info@laplacinte.md',
      imageUrl: '/images/restaurants/la-placinte.png',
      coverImageUrl: '/images/restaurants/la-placinte-stefan-cel-mare/1.png',
      cuisine: 'Молдавская',
      priceLevel: 2,
      websiteUrl: 'https://laplacinte.md',
      instagramUrl: 'https://www.instagram.com/laplacinte/',
      facebookUrl: 'https://www.facebook.com/laplacinte.md',
      googleMapsUrl: 'https://www.google.com/maps/place/La+Pl%C4%83cinte/@47.0244,28.8340,17z',
      rating: 4.5,
      reviewsCount: 1248,
      features: [
        RestaurantFeature.CARD_PAYMENT,
        RestaurantFeature.DELIVERY,
        RestaurantFeature.TAKEAWAY,
        RestaurantFeature.FAMILY_FRIENDLY,
        RestaurantFeature.WIFI,
        RestaurantFeature.PARKING,
        RestaurantFeature.RESERVATIONS,
      ],
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

  // --- Working hours (real schedules, per restaurant) ----------------------
  // dayOfWeek: 0 = Sunday … 6 = Saturday.
  // Note: the HH:MM pair must be same-day (close > open). Late-night venues
  // that close past midnight are capped at 23:59 so the "open now" logic
  // doesn't flip to "closed" right after midnight.
  const restaurantsForHours = [
    gastrobar,
    pegasTerrace,
    smokehouse,
    atticoTerrace,
    gardenTerrace,
    laPlacinte,
  ];

  // Overnight shifts are stored with `close <= open` — validator/slot-generator
  // treat them as spanning past midnight (e.g. "12:00 → 03:00" = until 3am next day).
  // Near-24h shifts (>= 22h long) switch the reservation UI to manual time entry.
  const workingHoursPlan: Record<string, Array<[string, string]>> = {
    // Gastrobar: daily 12:00–23:00
    [gastrobar.slug]: Array.from({ length: 7 }, () => ['12:00', '23:00'] as [string, string]),
    // Pegas: true 24/7 → open=00:00, close=00:00 treated as a 24h overnight shift.
    [pegasTerrace.slug]: Array.from({ length: 7 }, () => ['00:00', '00:00'] as [string, string]),
    // Smokehouse: daily 11:00–23:00
    [smokehouse.slug]: Array.from({ length: 7 }, () => ['11:00', '23:00'] as [string, string]),
    // Attico: late-night terrace. Sun–Thu 12:00–03:00 (next day), Fri–Sat 12:00–05:00.
    [atticoTerrace.slug]: [
      ['12:00', '03:00'], // Sun
      ['12:00', '03:00'], // Mon
      ['12:00', '03:00'], // Tue
      ['12:00', '03:00'], // Wed
      ['12:00', '03:00'], // Thu
      ['12:00', '05:00'], // Fri
      ['12:00', '05:00'], // Sat
    ],
    // Garden: daily 08:30–23:00
    [gardenTerrace.slug]: Array.from({ length: 7 }, () => ['08:30', '23:00'] as [string, string]),
    // La Plăcinte: daily 10:00–22:00
    [laPlacinte.slug]: Array.from({ length: 7 }, () => ['10:00', '22:00'] as [string, string]),
  };

  await Promise.all(
    restaurantsForHours.flatMap((restaurant) => {
      const plan = workingHoursPlan[restaurant.slug];
      if (!plan) return [];
      return plan.map((slot, dayOfWeek) =>
        prisma.workingHours.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek,
            openTime: slot[0],
            closeTime: slot[1],
            isClosed: false,
          },
        }),
      );
    }),
  );

  // --- Admin-restaurant links: только Gastrobar, два админа (без дубля MANAGER в RestaurantAdmin).
  await Promise.all([
    prisma.restaurantAdmin.create({
      data: { userId: adminUser1.id, restaurantId: gastrobar.id },
    }),
    prisma.restaurantAdmin.create({
      data: { userId: adminUser2.id, restaurantId: gastrobar.id },
    }),
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

  // Демо-брони только в Gastrobar — QR / админ-панель согласованы с персоналом seed.
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
        userId: userCarol.id,
        restaurantId: gastrobar.id,
        tableId: gastrobarFloor.tables[2].id,
        guestCount: 4,
        startAt: startOfWindow(20),
        endAt: withDuration(startOfWindow(20), reservationDurationMinutes),
        status: ReservationStatus.CONFIRMED,
        qrToken: 'qr_gastrobar_2',
        referenceCode: '7000002',
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

  // eslint-disable-next-line no-console -- удобно при локальном `prisma db seed`
  console.info(`
╔══════════════════════════════════════════════════════════╗
║  Демо-аккаунты (пароль для всех: ${DEMO_PASSWORD} )  ║
╠══════════════════════════════════════════════════════════╣
║  Владелец платформы: ${ownerUser.email}                  ║
║  Управляющий Gastrobar: manager.gastrobar@example.com   ║
║  Админ зала 1:       admin1.gastrobar@example.com         ║
║  Админ зала 2:       admin2.gastrobar@example.com         ║
║  Гости:              bob@example.com, carol@example.com   ║
╚══════════════════════════════════════════════════════════╝
`);
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
