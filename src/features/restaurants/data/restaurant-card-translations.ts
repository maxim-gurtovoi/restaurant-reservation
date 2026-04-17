import type { Locale } from '@/lib/i18n';

type CardTranslation = {
  name: string;
  description: string;
};

type LocaleDictionary = Record<string, CardTranslation>;

const RO_TRANSLATIONS: LocaleDictionary = {
  'attico-terrace-restaurant': {
    name: 'Restaurant & Terasă Attico',
    description: 'Terasă panoramică pe acoperiș, cu preparate mediteraneene și cocktailuri elegante.',
  },
  'garden-restaurant-terrace': {
    name: 'Restaurant & Terasă Garden',
    description: 'Bucătărie inspirată din ingrediente sezoniere, într-o atmosferă luminoasă și relaxată.',
  },
  gastrobar: {
    name: 'Gastrobar',
    description: 'Cocktailuri de autor și gustări sezoniere într-un bar cald și plin de viață din Chișinău.',
  },
  'pegas-terrace-restaurant': {
    name: 'Restaurant & Terasă Pegas',
    description: 'Loc modern cu terasă deschisă, meniuri variate și seri confortabile cu prietenii.',
  },
  smokehouse: {
    name: 'Smokehouse',
    description: 'Carne maturată, grătar pe foc și porții generoase pentru iubitorii de gust intens.',
  },
  'la-placinte-stefan-cel-mare': {
    name: 'La Plăcinte Ștefan cel Mare',
    description: 'Bucătărie moldovenească reinterpretată, plăcinte și preparate tradiționale pentru toată familia.',
  },
};

const RU_TRANSLATIONS: LocaleDictionary = {
  'attico-terrace-restaurant': {
    name: 'Attico Terrace & Restaurant',
    description: 'Панорамная терраса на крыше, средиземноморская кухня и элегантные коктейли.',
  },
  'garden-restaurant-terrace': {
    name: 'Garden Restaurant & Terrace',
    description: 'Кухня из сезонных продуктов в светлой и уютной атмосфере.',
  },
  gastrobar: {
    name: 'Gastrobar',
    description: 'Авторские коктейли и сезонные закуски в тёплом и живом баре Кишинёва.',
  },
  'pegas-terrace-restaurant': {
    name: 'Pegas Terrace Restaurant',
    description: 'Современный ресторан с открытой террасой, разнообразным меню и комфортными вечерами.',
  },
  smokehouse: {
    name: 'Smokehouse',
    description: 'Выдержанное мясо, огонь и гриль, большие порции для любителей насыщенного вкуса.',
  },
  'la-placinte-stefan-cel-mare': {
    name: 'La Plăcinte Ștefan cel Mare',
    description: 'Современная молдавская кухня, плацинды и традиционные блюда для всей семьи.',
  },
};

export function getRestaurantCardTranslation(slug: string, locale: Locale): CardTranslation | null {
  const dictionary = locale === 'ro' ? RO_TRANSLATIONS : RU_TRANSLATIONS;
  return dictionary[slug] ?? null;
}

