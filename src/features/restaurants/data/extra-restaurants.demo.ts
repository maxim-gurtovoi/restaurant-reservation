/**
 * Дополнительные демо-рестораны (~44) — общий источник для `prisma/seed.ts` и карточек UI.
 * Названия и кухни частично опираются на публичные подборки Кишинёва; контакты вымышленные.
 */
export type ExtraRestaurantSeedRow = {
  name: string;
  /** Если не задан — будет выведен из name */
  slug?: string;
  description: string;
  /** Текст карточки на румынском (локаль `ro`) */
  descriptionRo: string;
  /** Если задан — подпись на `ro` вместо `name` */
  nameRo?: string;
  address: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  reviewsCount: number;
};

export const EXTRA_RESTAURANT_SEED_ROWS: ExtraRestaurantSeedRow[] = [
  {
    name: 'Black Rabbit Gastro-Burrow',
    description:
      'Современная европейская кухня и авторские подачи в камерном зале. Подходит для ужина вдвоём и небольших компаний.',
    descriptionRo:
      'Bucătărie europeană modernă și plating creat într-un spațiu intim. Potrivit pentru cină în doi și grupuri mici.',
    address: 'Str. Alexandru cel Bun 82, Chișinău',
    cuisine: 'Европейская · Modern',
    priceLevel: 3,
    rating: 4.6,
    reviewsCount: 412,
  },
  {
    name: 'Taifas',
    description:
      'Румынская и балканская классика: мамалыга, сармале, домашние настойки и живой вечерний зал.',
    descriptionRo:
      'Clasic românesc și balcanic: mămăligă, sarmale, răchiu de casă și seară animată în sală.',
    address: 'Str. Mitropolit Dosoftei 118, Chișinău',
    cuisine: 'Румынская · Балканская',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 892,
  },
  {
    name: 'Popasul Dacilor',
    description:
      'Традиционный «попас» с печью и щедрыми порциями. Удобно для семейных обедов и праздников.',
    descriptionRo:
      'Popas tradițional cu cuptor și porții generoase. Ideal pentru prânzuri de familie și sărbători.',
    address: 'Str. Columna 116, Chișinău',
    cuisine: 'Молдавская · Традиционная',
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 1204,
  },
  {
    name: 'Fuior',
    description:
      'Румынская кухня с акцентом на фермерские продукты и сезонные меню. Спокойная атмосфера для ужина.',
    descriptionRo:
      'Bucătărie românească cu accent pe produse fermiere și meniuri sezoniere. Atmosferă liniștită pentru cină.',
    address: 'Str. București 67/1, Chișinău',
    cuisine: 'Румынская',
    priceLevel: 3,
    rating: 4.7,
    reviewsCount: 556,
  },
  {
    name: 'Mi Piace',
    description:
      'Итальянская классика: паста, ризотто и пицца из дровяной печи. Дружелюбный сервис и винная карта.',
    descriptionRo:
      'Clasic italian: paste, risotto și pizza din cuptor cu lemne. Serviciu prietenos și listă de vinuri.',
    address: 'Bd. Dacia 48, Chișinău',
    cuisine: 'Итальянская',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 743,
  },
  {
    name: 'Il Forno',
    description:
      'Траттория с пиццей на тонком тесте и антипасти для шеринга. Летняя терраса по вечерам.',
    descriptionRo:
      'Trattorie cu pizza pe blat subțire și antipasti de împărțit. Terasă de vară seara.',
    address: 'Str. Ismail 84, Chișinău',
    cuisine: 'Итальянская · Пицца',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 621,
  },
  {
    name: 'Crème de la Crème',
    slug: 'creme-de-la-creme-chisinau',
    description:
      'Кондитерская и кафе: торты, десерты и кофе. Идеально для встреч днём и сладких пауз.',
    descriptionRo:
      'Patiserie și cafenea: torturi, deserturi și cafea. Perfect pentru întâlniri de zi și pauze dulci.',
    address: 'Str. Pușkin 32, Chișinău',
    cuisine: 'Кондитерская · Кофе',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 1102,
  },
  {
    name: 'Asian Street',
    description:
      'Паназиатское меню: роллы, лапша wok, том ям и боулы. Быстрый формат без потери вкуса.',
    descriptionRo:
      'Meniu pan-asiatice: sushi, tăiței wok, tom yum și boluri. Format rapid, fără compromisuri la gust.',
    address: 'Str. Arheolog Ion Casian-Suceveanu 2, Chișinău',
    cuisine: 'Азиатская',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 445,
  },
  {
    name: 'Saperavi',
    description:
      'Грузинская кухня: хинкали, хачапури и шашлык. Домашняя атмосфера и настойки.',
    descriptionRo:
      'Bucătărie georgiană: khinkali, khachapuri și frigărui. Atmosferă casnică și infuzii.',
    address: 'Str. Maria Drăgan 16, Chișinău',
    cuisine: 'Грузинская',
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 778,
  },
  {
    name: 'Gök Oguz',
    slug: 'gok-oguz',
    description:
      'Болгарская и балканская кухня: мезе, люля и гриль. Уютный зал для компаний.',
    descriptionRo:
      'Bucătărie bulgară și balcanică: mezeluri, lula kebab și grătar. Salon cozy pentru grupuri.',
    address: 'Bd. Ștefan cel Mare și Sfînt 202, Chișinău',
    cuisine: 'Болгарская',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 334,
  },
  {
    name: "Andy's Pizza",
    slug: 'andys-pizza-chisinau',
    description:
      'Пицца на тонком и пышном тесте, салаты и паста. Формат для семей и доставки.',
    descriptionRo:
      'Pizza pe blat subțire și pufos, salate și paste. Format pentru familii și livrare.',
    address: 'Str. Ion Creangă 78, Chișinău',
    cuisine: 'Пицца · Итальянская',
    priceLevel: 1,
    rating: 4.2,
    reviewsCount: 2104,
  },
  {
    name: 'Caravan Actuell',
    description:
      'Европейская кухня и винная карта. Спокойный зал для деловых встреч и ужинов.',
    descriptionRo:
      'Bucătărie europeană și vinuri alese. Salon calm pentru întâlniri de afaceri și cine.',
    address: 'Str. Vlaicu Pârcălab 45, Chișinău',
    cuisine: 'Европейская',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 267,
  },
  {
    name: 'Rozmarin',
    description:
      'Средиземноморские акценты, много овощей и рыбы. Лёгкие обеды и ужины.',
    descriptionRo:
      'Accente mediteraneene, multe legume și pește. Prânzuri și cine ușoare.',
    address: 'Str. Veronica Micle 7, Chișinău',
    cuisine: 'Средиземноморская',
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 389,
  },
  {
    name: 'Propaganda Cafe',
    description:
      'Кофе, завтраки и бранчи до вечера. Рабочие столики и тихий дворик.',
    descriptionRo:
      'Cafea, mic dejun și brunch până seara. Mese de lucru și curte liniștită.',
    address: 'Str. Sciusev 103, Chișinău',
    cuisine: 'Кафе · Brunch',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 512,
  },
  {
    name: 'Zaxi Grill House',
    description:
      'Стейки, бургеры и гриль. Порции щедрые, музыка погромче — для вечеров с друзьями.',
    descriptionRo:
      'Steakuri, burgeri și grătar. Porții mari, muzică mai tare — pentru seri cu prietenii.',
    address: 'Str. Calea Ieșilor 8, Chișinău',
    cuisine: 'Гриль · Стейки',
    priceLevel: 3,
    rating: 4.3,
    reviewsCount: 601,
  },
  {
    name: 'Berlin Pub',
    description:
      'Крафтовое пиво, снеки и немецкие колбаски. Длинные столы для болельщиков и компаний.',
    descriptionRo:
      'Bere artizanală, gustări și cârnați germani. Mese lungi pentru meciuri și grupuri.',
    address: 'Str. Tighina 65, Chișinău',
    cuisine: 'Паб · Европейская',
    priceLevel: 2,
    rating: 4.2,
    reviewsCount: 887,
  },
  {
    name: 'Draft Station',
    description:
      'Роторная линия кранов и закуски к пиву. Неформальная атмосфера у центра.',
    descriptionRo:
      'Multe crane la bere și gustări. Atmosferă relaxată aproape de centru.',
    address: 'Str. Mitropolit Varlaam 75, Chișinău',
    cuisine: 'Паб · Закуски',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 412,
  },
  {
    name: 'Osho Kitchen',
    description:
      'Паназиатское фьюжн-меню и коктейли. Вечером — DJ-сеты по выходным.',
    descriptionRo:
      'Meniu fusion pan-asiat și cocktailuri. DJ în weekend seara.',
    address: 'Bd. Decebal 99, Chișinău',
    cuisine: 'Фьюжн · Азия',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 298,
  },
  {
    name: 'Select Cafe',
    description:
      'Кофе specialty, десерты и лёгкие салаты. Удобно между встречами в центре.',
    descriptionRo:
      'Cafea specialty, deserturi și salate ușoare. Între întâlniri în centru.',
    address: 'Str. 31 August 1989 127, Chișinău',
    cuisine: 'Кофе · Ланч',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 356,
  },
  {
    name: 'Atypic',
    description:
      'Авторская кухня с дегустационными сетами по пятницам. Камерный зал на мало мест.',
    descriptionRo:
      'Bucătărie de autor cu meniuri de degustare vinerea. Salon mic, locuri puține.',
    address: 'Str. Vasile Lupu 62, Chișinău',
    cuisine: 'Авторская · Fine casual',
    priceLevel: 4,
    rating: 4.7,
    reviewsCount: 198,
  },
  {
    name: 'Fusion Kitchen',
    description:
      'Смешение азиатских и европейских техник. Удобное меню для компании «на поделиться».',
    descriptionRo:
      'Tehnici asiatice și europene amestecate. Meniu bun de împărțit în grup.',
    address: 'Str. Alecu Russo 1, Chișinău',
    cuisine: 'Фьюжн',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 267,
  },
  {
    name: 'Bucătăria Mamei',
    slug: 'bucataria-mamei',
    description:
      'Домашняя молдавская кухня: супы, второе и выпечка. Как у мамы, но в ресторане.',
    descriptionRo:
      'Bucătărie moldovenească ca acasă: ciorbe, feluri principale și cozonac. Ca la mama, dar la restaurant.',
    address: 'Str. Ion Neculce 12, Chișinău',
    cuisine: 'Молдавская · Домашняя',
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 924,
  },
  {
    name: 'Vatra Neamului',
    description:
      'Балканская и молдавская классика, много мяса на гриле и гарниров из овощей.',
    descriptionRo:
      'Clasic balcanic și moldovenesc, multă carne la grătar și garnituri de legume.',
    address: 'Str. Calea Orheiului 109, Chișinău',
    cuisine: 'Балканская',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 512,
  },
  {
    name: 'Mamalyga',
    description:
      'Мамалыга, борщи и домашние настойки. Просторный зал для больших столов.',
    descriptionRo:
      'Mămăligă, borșuri și răchiu de casă. Spațios pentru mese mari.',
    address: 'Str. Socoleni 2/6, Chișinău',
    cuisine: 'Молдавская · Украинская',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 667,
  },
  {
    name: 'SupaDupa',
    description:
      'Супы, боулы и свежие салаты на каждый день. Быстрый обед без тяжести.',
    descriptionRo:
      'Ciorbe, boluri și salate proaspete în fiecare zi. Prânz rapid, ușor.',
    address: 'Str. Banulescu-Bodoni 35, Chișinău',
    cuisine: 'Здоровая кухня · Супы',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 289,
  },
  {
    name: 'Torro Grill',
    description:
      'Аргентинский и уругвайский гриль, много стейков и соусов chimichurri.',
    descriptionRo:
      'Grătar argentinian și uruguayan, multe steakuri și sos chimichurri.',
    address: 'Str. Maria Cebotari 57, Chișinău',
    cuisine: 'Гриль · Стейкхаус',
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 401,
  },
  {
    name: "Franko's",
    slug: 'frankos-chisinau',
    description:
      'Пицца, паста и детское меню. Удобно для семейных выходных.',
    descriptionRo:
      'Pizza, paste și meniu pentru copii. Convenabil în weekend cu familia.',
    address: 'Bd. Moscova 15/5, Chișinău',
    cuisine: 'Пицца · Семейная',
    priceLevel: 2,
    rating: 4.2,
    reviewsCount: 1334,
  },
  {
    name: 'Pizza Mania',
    description:
      'Быстрая пицца и комбо. Формат для ужина дома и небольших залов.',
    descriptionRo:
      'Pizza rapidă și combo. Pentru cină acasă și săli mici.',
    address: 'Str. Ion Inculeț 10, Chișinău',
    cuisine: 'Пицца',
    priceLevel: 1,
    rating: 4.1,
    reviewsCount: 1542,
  },
  {
    name: 'Molotov Rum Bar',
    description:
      'Ром, коктейли tiki и карибские закуски. Темнее света — только вечером.',
    descriptionRo:
      'Rom, cocktailuri tiki și gustări caraibe. Ambianță întunecată — mai ales seara.',
    address: 'Str. Alexei Mateevici 55, Chișinău',
    cuisine: 'Бар · Карибская',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 223,
  },
  {
    name: 'Invino Enoteca',
    description:
      'Вина Молдовы и Италии, сыры и холодные тарелки. Дегустации по записи.',
    descriptionRo:
      'Vinuri din Moldova și Italia, brânzeturi și platouri reci. Degustări cu programare.',
    address: 'Str. Mitropolit Gavriil Bănulescu-Bodoni 39, Chișinău',
    cuisine: 'Винный бар',
    priceLevel: 3,
    rating: 4.6,
    reviewsCount: 312,
  },
  {
    name: 'Grazie Mille',
    description:
      'Итальянская кухня и домашние десерты. Уютный зал на 40 мест.',
    descriptionRo:
      'Bucătărie italiană și deserturi de casă. Salon cozy pentru aproximativ 40 locuri.',
    address: 'Str. Nicolae Iorga 6, Chișinău',
    cuisine: 'Итальянская',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 278,
  },
  {
    name: 'Trattoria della Nonna',
    slug: 'trattoria-della-nonna',
    description:
      'Паста ручной работы и второе из духовки. Меню как в итальянской семье.',
    descriptionRo:
      'Paste făcute manual și feluri la cuptor. Meniu ca într-o familie italiană.',
    address: 'Str. Petru Rareș 45, Chișinău',
    cuisine: 'Итальянская',
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 356,
  },
  {
    name: 'La Bettola',
    description:
      'Итальянское вино и простые блюда: ризотто, осьминог на гриле, тирамису.',
    descriptionRo:
      'Vin italian și preparate simple: risotto, caracatiță la grătar, tiramisu.',
    address: 'Str. Columna 102, Chișinău',
    cuisine: 'Итальянская · Вино',
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 244,
  },
  {
    name: 'Green Hours',
    description:
      'Вегетарианские и веганские блюда, смузи и боулы. Светлый интерьер.',
    descriptionRo:
      'Preparate vegetariene și vegane, smoothie și boluri. Interior luminos.',
    address: 'Str. Maria Drăgan 22, Chișinău',
    cuisine: 'Вегетарианская',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 198,
  },
  {
    name: 'Kiwi Organic Cafe',
    description:
      'Органические завтраки и кофе. Мало жарки, много запечённого.',
    descriptionRo:
      'Mic dejun organic și cafea. Puțin prăjit, mult preparat la cuptor.',
    address: 'Str. Sciusev 64, Chișinău',
    cuisine: 'Органик · Кафе',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 167,
  },
  {
    name: 'Salonas Je',
    slug: 'salonas-je',
    description:
      'Литовская и балтийская кухня в необычном интерьере. Рыба и копчёности.',
    descriptionRo:
      'Bucătărie lituaniană și baltică într-un interior neobișnuit. Pește și afumături.',
    address: 'Str. București 3/1, Chișinău',
    cuisine: 'Балтийская',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 145,
  },
  {
    name: 'Bendery Club',
    description:
      'Шашлык, люля и салаты «по-рынку». Громкая музыка по пятницам.',
    descriptionRo:
      'Frigărui, lula kebab și salate „de piață”. Muzică tare vinerea.',
    address: 'Str. Uzinelor 4, Chișinău',
    cuisine: 'Гриль · Шашлык',
    priceLevel: 2,
    rating: 4.2,
    reviewsCount: 534,
  },
  {
    name: 'Wine House',
    description:
      'Молдавские вина и закуски к бокалу. Небольшой зал и терраса.',
    descriptionRo:
      'Vinuri moldovenești și gustări la pahar. Salon mic și terasă.',
    address: 'Str. 31 August 1989 141, Chișinău',
    cuisine: 'Винный бар · Tapas',
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 289,
  },
  {
    name: 'Beer House Chișinău',
    slug: 'beer-house-chisinau',
    description:
      'Локальное и импортное пиво, крылышки и снеки. Трансляции матчей.',
    descriptionRo:
      'Bere locală și import, aripioare și gustări. Transmisiuni de meciuri.',
    address: 'Bd. Dacia 28, Chișinău',
    cuisine: 'Паб',
    priceLevel: 2,
    rating: 4.1,
    reviewsCount: 712,
  },
  {
    name: 'Kellers',
    description:
      'Немецкая кухня и пиво в кегах. Длинные скамьи и колбаски на гриле.',
    descriptionRo:
      'Bucătărie germană și bere la butoi. Benchuri lungi și cârnați la grătar.',
    address: 'Str. Ismail 58, Chișinău',
    cuisine: 'Немецкая · Паб',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 423,
  },
  {
    name: 'La Copăc',
    slug: 'la-copac',
    description:
      'Летняя терраса под деревьями, мангал и салаты. Работает сезонно в тёплую погоду.',
    descriptionRo:
      'Terasă de vară sub copaci, grătar și salate. Sezonier pe vreme caldă.',
    address: 'Str. Valea Crucii 12, Chișinău',
    cuisine: 'Гриль · Терраса',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 312,
  },
  {
    name: 'Tiramisu',
    description:
      'Итальянская кухня с акцентом на десерты. Кофе и торты на вынос.',
    descriptionRo:
      'Bucătărie italiană cu accent pe deserturi. Cafea și torturi la pachet.',
    address: 'Str. Pushkin 22, Chișinău',
    cuisine: 'Итальянская · Десерты',
    priceLevel: 2,
    rating: 4.3,
    reviewsCount: 445,
  },
  {
    name: 'Krysha Sky Bar',
    slug: 'krysha-sky-bar',
    description:
      'Панорамный бар на крыше: коктейли и лёгкие закуски. Лучше бронировать заранее.',
    descriptionRo:
      'Bar panoramic pe acoperiș: cocktailuri și gustări ușoare. Recomandăm rezervare din timp.',
    address: 'Bd. Ștefan cel Mare și Sfînt 4, Chișinău',
    cuisine: 'Бар · Панорама',
    priceLevel: 4,
    rating: 4.5,
    reviewsCount: 512,
  },
];
