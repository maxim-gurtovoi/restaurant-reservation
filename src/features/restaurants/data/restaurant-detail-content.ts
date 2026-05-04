/**
 * Демо-контент для страниц ресторанов (по slug).
 * Не из БД — упрощает объём дипломного проекта.
 *
 * Структурированные факты (кухня, ценовой уровень, фичи, адрес, соцсети, рейтинг) живут в БД
 * и читаются сервисом `getRestaurantBySlug`. Здесь остаются только подборки, которые
 * не оправдывают отдельных таблиц: отзывы-демо, фрагмент меню, оценки внешних площадок.
 */

export type ReviewPreview = {
  author: string;
  text: string;
  rating: number;
};

export type MenuPreviewItem = {
  name: string;
  price: string;
};

export type ExternalRatingSource = 'google' | 'tripadvisor' | 'relax';

export type ExternalRating = {
  source: ExternalRatingSource;
  rating: number;
  reviewsCount: number;
};

export type RestaurantDetailSupportingContent = {
  aboutDescription?: string;
  reviews: ReviewPreview[];
  menuPreview: MenuPreviewItem[];
  externalRatings: ExternalRating[];
};

export const DEFAULT_RESTAURANT_DETAIL_CONTENT: RestaurantDetailSupportingContent = {
  aboutDescription: 'Уютное место для встреч с близкими. Выберите столик и удобное время.',
  reviews: [
    { author: 'Гость', rating: 5, text: 'Отличный сервис и уютная атмосфера.' },
    { author: 'Алекс К.', rating: 4, text: 'Простое бронирование и приветливый персонал.' },
  ],
  menuPreview: [
    { name: 'Суп дня от шефа', price: 'MDL 65' },
    { name: 'Салат «Домашний»', price: 'MDL 85' },
    { name: 'Блюда с гриля', price: 'от MDL 180' },
  ],
  externalRatings: [
    { source: 'google', rating: 4.5, reviewsCount: 320 },
    { source: 'tripadvisor', rating: 4.4, reviewsCount: 180 },
  ],
};

export const RESTAURANT_DETAIL_CONTENT_BY_SLUG: Record<string, RestaurantDetailSupportingContent> = {
  gastrobar: {
    aboutDescription:
      'Авторские коктейли и сезонные закуски в тёплом оживлённом баре Кишинёва. Подойдёт для неспешного ужина с друзьями.',
    reviews: [
      { author: 'Наталья Х.', rating: 5, text: 'Тёплая атмосфера, отличные коктейли и быстрый сервис.' },
      { author: 'Михай Л.', rating: 4, text: 'Хороший баланс меню и удобное бронирование столика.' },
      { author: 'Дойна Ч.', rating: 5, text: 'Закуски свежие — отлично с негрони.' },
    ],
    menuPreview: [
      { name: 'Сезонный тартар', price: 'MDL 145' },
      { name: 'Осьминог на гриле', price: 'MDL 195' },
      { name: 'Буррата с томатами', price: 'MDL 125' },
      { name: 'Авторский коктейль', price: 'от MDL 95' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.7, reviewsCount: 412 },
      { source: 'tripadvisor', rating: 4.5, reviewsCount: 256 },
      { source: 'relax', rating: 4.6, reviewsCount: 98 },
    ],
  },
  'pegas-terrace-restaurant': {
    aboutDescription:
      'Светлая терраса, внимательный сервис и блюда на компанию. Для долгих ланчей, спокойных разговоров и тёплых кишинёвских вечеров.',
    reviews: [
      { author: 'Елена С.', rating: 5, text: 'Чудесная терраса и очень внимательный персонал.' },
      { author: 'Дан П.', rating: 4, text: 'Отличное место для ужина.' },
      { author: 'Лилия Р.', rating: 5, text: 'Вино отлично сочеталось с рыбой — незабываемый вечер.' },
    ],
    menuPreview: [
      { name: 'Мезе-плато с террасы', price: 'MDL 165' },
      { name: 'Морской окунь на гриле', price: 'MDL 225' },
      { name: 'Говяжья вырезка', price: 'MDL 265' },
      { name: 'Тирамису', price: 'MDL 85' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.5, reviewsCount: 612 },
      { source: 'tripadvisor', rating: 4.3, reviewsCount: 291 },
      { source: 'relax', rating: 4.4, reviewsCount: 135 },
    ],
  },
  smokehouse: {
    aboutDescription:
      'Мясо медленного копчения, фирменные BBQ-соусы и сытные гарниры. Для любителей насыщенного дымного вкуса и больших порций.',
    reviews: [
      { author: 'Андрей В.', rating: 5, text: 'Рёбра и соусы — именно то, за чем стоит прийти.' },
      { author: 'Ирина М.', rating: 4, text: 'Сытные порции; здорово для обеда в выходной.' },
      { author: 'Петру С.', rating: 5, text: 'Брискет нежный; гарниры на компанию.' },
    ],
    menuPreview: [
      { name: 'Копчёный брискет (200 г)', price: 'MDL 185' },
      { name: 'BBQ-рёбра, половина решётки', price: 'MDL 175' },
      { name: 'Мак-н-чиз гарнир', price: 'MDL 65' },
      { name: 'Набор фирменных соусов', price: 'MDL 45' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.8, reviewsCount: 756 },
      { source: 'tripadvisor', rating: 4.6, reviewsCount: 342 },
      { source: 'relax', rating: 4.7, reviewsCount: 188 },
    ],
  },
  'attico-terrace-restaurant': {
    aboutDescription:
      'Ужин на террасе на крыше: современные средиземноморские блюда и изящные коктейли. Идеально для свиданий и особых случаев.',
    reviews: [
      { author: 'Крис Т.', rating: 5, text: 'Терраса на крыше — отлично для праздников.' },
      { author: 'Мария Г.', rating: 4, text: 'Стильное место; бронь через приложение прошла гладко.' },
      { author: 'Джулиан Ф.', rating: 5, text: 'Коктейли на закате — лучший вид.' },
    ],
    menuPreview: [
      { name: 'Трио мезе', price: 'MDL 155' },
      { name: 'Ризотто с морепродуктами', price: 'MDL 215' },
      { name: 'Бараньи отбивные', price: 'MDL 245' },
      { name: 'Апероль-спритц', price: 'MDL 85' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.8, reviewsCount: 485 },
      { source: 'tripadvisor', rating: 4.7, reviewsCount: 214 },
      { source: 'relax', rating: 4.8, reviewsCount: 112 },
    ],
  },
  'garden-restaurant-terrace': {
    aboutDescription:
      'Кухня в духе сада на основе свежих сезонных продуктов. Светлый уютный зал для семейных ужинов и неспешных встреч.',
    reviews: [
      { author: 'Ольга П.', rating: 5, text: 'Свежие вкусы и спокойная садовая атмосфера.' },
      { author: 'Серджу Д.', rating: 4, text: 'Удобно для семейного ужина; терпеливы к детям.' },
      { author: 'Ана Т.', rating: 5, text: 'Травяные ноты в блюдах — легко и продуманно.' },
    ],
    menuPreview: [
      { name: 'Садовый гаспачо', price: 'MDL 75' },
      { name: 'Тарт с овощами', price: 'MDL 125' },
      { name: 'Курица в травяной панировке', price: 'MDL 165' },
      { name: 'Сезонный фруктовый сорбет', price: 'MDL 55' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.6, reviewsCount: 388 },
      { source: 'tripadvisor', rating: 4.4, reviewsCount: 162 },
      { source: 'relax', rating: 4.5, reviewsCount: 91 },
    ],
  },
  'la-placinte-stefan-cel-mare': {
    aboutDescription:
      'Традиционная молдавская кухня с современным акцентом. Домашние плацинды, местные блюда и по-настоящему уютная атмосфера.',
    reviews: [
      { author: 'Виктория Р.', rating: 5, text: 'Плацинды и зама — как дома, очень рекомендую.' },
      { author: 'Ион Б.', rating: 5, text: 'Доступно, сытно и стабильное качество.' },
      { author: 'Кэтэлина М.', rating: 4, text: 'В ланч бывает шумно, но того стоит — порции большие.' },
    ],
    menuPreview: [
      { name: 'Плацинды с брынзой', price: 'MDL 45' },
      { name: 'Традиционная зама', price: 'MDL 75' },
      { name: 'Сармале с мамалыгой', price: 'MDL 95' },
      { name: 'Плацинда с яблоками', price: 'MDL 40' },
    ],
    externalRatings: [
      { source: 'google', rating: 4.6, reviewsCount: 1382 },
      { source: 'tripadvisor', rating: 4.5, reviewsCount: 612 },
      { source: 'relax', rating: 4.7, reviewsCount: 284 },
    ],
  },
};

export function getRestaurantDetailSupportingContent(
  slug: string,
): RestaurantDetailSupportingContent {
  return RESTAURANT_DETAIL_CONTENT_BY_SLUG[slug] ?? DEFAULT_RESTAURANT_DETAIL_CONTENT;
}
