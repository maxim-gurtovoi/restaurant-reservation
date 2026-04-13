/**
 * Демо-контент для страниц ресторанов (по slug).
 * Не из БД — упрощает объём дипломного проекта.
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

export type RestaurantDetailSupportingContent = {
  ratingSummary: string;
  cuisineTags: string[];
  priceBand: string;
  amenities: string[];
  reviews: ReviewPreview[];
  menuPreview: MenuPreviewItem[];
};

export const DEFAULT_RESTAURANT_DETAIL_CONTENT: RestaurantDetailSupportingContent = {
  ratingSummary: '4.6',
  cuisineTags: ['Локальные блюда', 'Непринуждённо'],
  priceBand: 'MDL 250–450 с человека',
  amenities: ['Бронирование', 'Зал в помещении', 'С детьми'],
  reviews: [
    { author: 'Гость', rating: 5, text: 'Отличный сервис и уютная атмосфера.' },
    { author: 'Алекс К.', rating: 4, text: 'Простое бронирование и приветливый персонал.' },
  ],
  menuPreview: [
    { name: 'Суп дня от шефа', price: 'MDL 65' },
    { name: 'Салат «Домашний»', price: 'MDL 85' },
    { name: 'Блюда с гриля', price: 'от MDL 180' },
  ],
};

export const RESTAURANT_DETAIL_CONTENT_BY_SLUG: Record<string, RestaurantDetailSupportingContent> = {
  gastrobar: {
    ratingSummary: '4.8',
    cuisineTags: ['Коктейль-бар', 'Сезонное меню', 'Средиземноморское'],
    priceBand: 'MDL 300–550 с человека',
    amenities: ['Вечера с музыкой', 'Зал в помещении', 'Кухня до поздна'],
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
  },
  'pegas-terrace-restaurant': {
    ratingSummary: '4.7',
    cuisineTags: ['Терраса', 'Европейская кухня', 'Винная карта'],
    priceBand: 'MDL 280–500 с человека',
    amenities: ['Летняя терраса', 'Романтика', 'Вид на город'],
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
  },
  smokehouse: {
    ratingSummary: '4.7',
    cuisineTags: ['BBQ', 'Копчёное мясо', 'Комфорт-фуд'],
    priceBand: 'MDL 260–480 с человека',
    amenities: ['Большие порции', 'Семейные столы', 'На вынос'],
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
  },
  'attico-terrace-restaurant': {
    ratingSummary: '4.8',
    cuisineTags: ['Крыша', 'Средиземноморье', 'Коктейли'],
    priceBand: 'MDL 320–600 с человека',
    amenities: ['Закаты', 'Свидания', 'Мероприятия'],
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
  },
  'garden-restaurant-terrace': {
    ratingSummary: '4.6',
    cuisineTags: ['Сезонное', 'Садовая терраса', 'Европейское'],
    priceBand: 'MDL 270–490 с человека',
    amenities: ['Сад', 'Дети welcome', 'Неспешно'],
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
  },
  'la-placinte-stefan-cel-mare': {
    ratingSummary: '4.9',
    cuisineTags: ['Молдавская кухня', 'Домашние пироги', 'Традиции'],
    priceBand: 'MDL 200–380 с человека',
    amenities: ['Локальная классика', 'Уютный зал', 'Быстрый ланч'],
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
  },
};

export function getRestaurantDetailSupportingContent(
  slug: string,
): RestaurantDetailSupportingContent {
  return RESTAURANT_DETAIL_CONTENT_BY_SLUG[slug] ?? DEFAULT_RESTAURANT_DETAIL_CONTENT;
}
