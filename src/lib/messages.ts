import type { Locale } from '@/lib/i18n';

export const messages = {
  ru: {
    common: {
      login: 'Вход',
      register: 'Регистрация',
      noAccount: 'Нет аккаунта?',
      haveAccount: 'Уже есть аккаунт?',
      signUpAction: 'Зарегистрироваться',
      signInAction: 'Войти',
      closeModal: 'Закрыть окно',
      close: 'Закрыть',
    },
    appShell: {
      restaurants: 'Рестораны',
      myReservations: 'Мои брони',
      admin: 'Администратор',
      manager: 'Управляющий',
      search: 'Поиск',
      searchAria: 'Поиск ресторанов',
      localeToggleAria: 'Переключить язык интерфейса',
    },
    home: {
      badge: 'Сервис бронирования',
      heroTitle: 'Забронируйте столик в любимом ресторане',
      heroDescription:
        'Выбирайте заведение, стол на плане зала и мгновенно подтверждайте бронь с QR-кодом в едином сервисе TableFlow.',
      restaurantsCta: 'Смотреть рестораны',
      registerCta: 'Бесплатная регистрация',
      featuredLabel: 'Подборка',
      featuredTitle: 'Рекомендуемые рестораны',
      featuredDescription: 'Заведения, которые чаще всего бронируют гости.',
      allRestaurants: 'Все рестораны',
      processLabel: 'Простой процесс',
      processTitle: 'Как это работает',
      advantagesLabel: 'Преимущества',
      advantagesTitle: 'Почему гости выбирают TableFlow',
      bottomTitle: 'Готовы забронировать столик?',
      bottomDescription: 'Регистрация бесплатна, подтверждение брони — сразу после оформления.',
      bottomRegister: 'Зарегистрироваться',
      filters: {
        searchPlaceholder: 'Поиск по названию или кухне',
        sortLabel: 'Сортировка',
        sort: {
          rating: 'По рейтингу',
          name: 'По названию',
          price_asc: 'Сначала дешевле',
          price_desc: 'Сначала дороже',
        },
        openNow: 'Открыто сейчас',
        reset: 'Сбросить',
        noResults: 'Ничего не найдено',
        noResultsHint: 'Попробуйте изменить параметры поиска',
        priceLabel: 'Цена',
        featuresLabel: 'Особенности',
        features: {
          TERRACE: 'Терраса',
          LIVE_MUSIC: 'Живая музыка',
          WIFI: 'Wi-Fi',
          PARKING: 'Парковка',
          FAMILY_FRIENDLY: 'С детьми',
          PET_FRIENDLY: 'С питомцем',
        } as Record<string, string>,
        pagination: {
          ariaLabel: 'Страницы списка ресторанов',
          prev: 'Назад',
          next: 'Вперёд',
          showing: (from: number, to: number, total: number) =>
            `Показано ${from}–${to} из ${total.toLocaleString('ru-RU')}`,
        },
      },
    },
    restaurants: {
      title: 'Рестораны',
      subtitle: 'Выберите заведение, чтобы увидеть столики и план зала.',
      byType: 'По типу',
      details: 'Подробнее',
      reserve: 'Забронировать',
      fallbackDescription: 'План зала, свободные столики и бронирование на удобное время.',
      categories: [
        '🌇 Панорама / крыша',
        '🍔 Непринуждённо',
        '🍷 Изысканно',
        '👨‍👩‍👧 С детьми',
        '🌿 Терраса / сад',
        '🎶 Живая музыка',
      ],
    },
    restaurantDetail: {
      hero: {
        rating: 'Рейтинг',
        reviews: (count: number) => `${count.toLocaleString('ru-RU')} отзывов`,
        ratingNotYet: 'Нет рейтинга',
        reserveCta: 'Забронировать столик',
        callCta: 'Позвонить',
        openNow: 'Сейчас открыто',
        closedNow: 'Сейчас закрыто',
        statusUnknown: 'Часы работы недоступны',
        coverAlt: (name: string) => `Обложка ресторана ${name}`,
      },
      price: {
        label: 'Средний чек',
        hint: (level: number) => {
          switch (level) {
            case 1: return 'Доступно';
            case 2: return 'Умеренно';
            case 3: return 'Выше среднего';
            case 4: return 'Премиум';
            default: return 'Не указано';
          }
        },
      },
      about: {
        title: 'О заведении',
        fallback: 'Уютное место для встреч с близкими. Выберите столик и удобное время.',
      },
      quickFacts: {
        title: 'Коротко о ресторане',
        cuisine: 'Кухня',
        priceTier: 'Чек',
        rating: 'Рейтинг',
        capacity: 'Вместимость',
        capacityValue: (total: number) => `до ${total} гостей`,
        floors: 'Залы',
        floorsValue: (count: number) => `${count} ${count === 1 ? 'зал' : count < 5 ? 'зала' : 'залов'}`,
      },
      features: {
        title: 'Что есть в заведении',
        labels: {
          CARD_PAYMENT: 'Оплата картой',
          DELIVERY: 'Доставка',
          TAKEAWAY: 'С собой',
          TERRACE: 'Терраса',
          LIVE_MUSIC: 'Живая музыка',
          PARKING: 'Парковка',
          WIFI: 'Wi-Fi',
          PET_FRIENDLY: 'Можно с питомцем',
          FAMILY_FRIENDLY: 'С детьми',
          RESERVATIONS: 'Бронирование',
        } as Record<string, string>,
      },
      hours: {
        title: 'Часы работы',
        today: 'сегодня',
        dayOff: 'Выходной',
        unavailable: 'Недоступно',
        allDay: 'Круглосуточно',
        dayNames: {
          0: 'Воскресенье',
          1: 'Понедельник',
          2: 'Вторник',
          3: 'Среда',
          4: 'Четверг',
          5: 'Пятница',
          6: 'Суббота',
        } as Record<number, string>,
      },
      address: {
        title: 'Адрес',
        missing: 'Адрес не указан',
        mapLink: 'Открыть на карте',
      },
      socials: {
        title: 'Ссылки',
        website: 'Сайт',
        instagram: 'Instagram',
        facebook: 'Facebook',
        googleMaps: 'Google Maps',
      },
      contacts: {
        title: 'Контакты',
        phone: 'Телефон',
        email: 'Email',
      },
      externalRatings: {
        title: 'Отзывы в сети',
        sources: {
          google: 'Google Maps',
          tripadvisor: 'TripAdvisor',
          relax: 'Relax.md',
        } as Record<string, string>,
      },
      similar: {
        title: 'Похожие заведения',
        description: 'Ещё несколько ресторанов, которые могут вам понравиться.',
        seeAll: 'Все рестораны',
      },
      floorPlan: {
        title: 'План зала',
        description: 'Схема расстановки столов. Чтобы выбрать дату и свободный столик, перейдите к брони.',
        reserveCta: 'Забронировать столик',
        notConfigured: 'План зала для этого заведения пока не настроен.',
        eyebrow: 'Обзор · план зала',
      },
      menu: {
        title: 'Фрагмент меню',
        note: 'Пример блюд — не онлайн-заказ',
      },
      reviews: {
        title: 'Отзывы гостей',
      },
      actions: {
        reserveCta: 'Забронировать столик',
        callCta: (phone: string) => `Позвонить · ${phone}`,
        callFallback: 'Позвонить в ресторан',
      },
    },
    footer: {
      description: 'Система бронирования столиков с регистрацией по QR-коду.',
      navTitle: 'Разделы',
      howItWorks: 'Как это работает',
      docsTitle: 'Документы',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      projectTitle: 'Проект',
    },
  },
  ro: {
    common: {
      login: 'Autentificare',
      register: 'Înregistrare',
      noAccount: 'Nu ai cont?',
      haveAccount: 'Ai deja cont?',
      signUpAction: 'Înregistrează-te',
      signInAction: 'Autentifică-te',
      closeModal: 'Închide fereastra',
      close: 'Închide',
    },
    appShell: {
      restaurants: 'Restaurante',
      myReservations: 'Rezervările mele',
      admin: 'Administrator',
      manager: 'Director',
      search: 'Căutare',
      searchAria: 'Căutare restaurante',
      localeToggleAria: 'Comută limba interfeței',
    },
    home: {
      badge: 'Platformă de rezervări',
      heroTitle: 'Rezervă o masă la restaurantul tău preferat',
      heroDescription:
        'Alege localul, masa din plan și confirmă rezervarea instant prin cod QR în TableFlow.',
      restaurantsCta: 'Vezi restaurantele',
      registerCta: 'Înregistrare gratuită',
      featuredLabel: 'Selecție',
      featuredTitle: 'Restaurante recomandate',
      featuredDescription: 'Localurile rezervate cel mai des de clienți.',
      allRestaurants: 'Toate restaurantele',
      processLabel: 'Proces simplu',
      processTitle: 'Cum funcționează',
      advantagesLabel: 'Avantaje',
      advantagesTitle: 'De ce aleg clienții TableFlow',
      bottomTitle: 'Ești gata să rezervi o masă?',
      bottomDescription: 'Înregistrarea este gratuită, iar confirmarea vine imediat după rezervare.',
      bottomRegister: 'Înregistrează-te',
      filters: {
        searchPlaceholder: 'Caută după nume sau bucătărie',
        sortLabel: 'Sortare',
        sort: {
          rating: 'După rating',
          name: 'După nume',
          price_asc: 'Mai ieftine întâi',
          price_desc: 'Mai scumpe întâi',
        },
        openNow: 'Deschis acum',
        reset: 'Resetează',
        noResults: 'Nimic găsit',
        noResultsHint: 'Încearcă să modifici filtrele de căutare',
        priceLabel: 'Preț',
        featuresLabel: 'Facilități',
        features: {
          TERRACE: 'Terasă',
          LIVE_MUSIC: 'Muzică live',
          WIFI: 'Wi-Fi',
          PARKING: 'Parcare',
          FAMILY_FRIENDLY: 'Cu copii',
          PET_FRIENDLY: 'Animale acceptate',
        } as Record<string, string>,
        pagination: {
          ariaLabel: 'Pagini listă restaurante',
          prev: 'Înapoi',
          next: 'Înainte',
          showing: (from: number, to: number, total: number) =>
            `Se afișează ${from}–${to} din ${total.toLocaleString('ro-RO')}`,
        },
      },
    },
    restaurants: {
      title: 'Restaurante',
      subtitle: 'Alege localul pentru a vedea mesele și planul sălii.',
      byType: 'După tip',
      details: 'Detalii',
      reserve: 'Rezervă',
      fallbackDescription: 'Planul sălii, mese libere și rezervare rapidă la ora dorită.',
      categories: [
        '🌇 Panoramă / rooftop',
        '🍔 Relaxat',
        '🍷 Rafinat',
        '👨‍👩‍👧 Cu copii',
        '🌿 Terasă / grădină',
        '🎶 Muzică live',
      ],
    },
    restaurantDetail: {
      hero: {
        rating: 'Rating',
        reviews: (count: number) => `${count.toLocaleString('ro-RO')} recenzii`,
        ratingNotYet: 'Fără rating',
        reserveCta: 'Rezervă o masă',
        callCta: 'Sună',
        openNow: 'Deschis acum',
        closedNow: 'Închis acum',
        statusUnknown: 'Program indisponibil',
        coverAlt: (name: string) => `Copertă ${name}`,
      },
      price: {
        label: 'Cec mediu',
        hint: (level: number) => {
          switch (level) {
            case 1: return 'Accesibil';
            case 2: return 'Moderat';
            case 3: return 'Peste medie';
            case 4: return 'Premium';
            default: return 'Nespecificat';
          }
        },
      },
      about: {
        title: 'Despre local',
        fallback: 'Loc primitor pentru întâlniri cu cei dragi. Alege o masă și ora potrivită.',
      },
      quickFacts: {
        title: 'Pe scurt',
        cuisine: 'Bucătărie',
        priceTier: 'Preț',
        rating: 'Rating',
        capacity: 'Capacitate',
        capacityValue: (total: number) => `până la ${total} oaspeți`,
        floors: 'Săli',
        floorsValue: (count: number) => `${count} ${count === 1 ? 'sală' : 'săli'}`,
      },
      features: {
        title: 'Facilități',
        labels: {
          CARD_PAYMENT: 'Plată cu cardul',
          DELIVERY: 'Livrare',
          TAKEAWAY: 'La pachet',
          TERRACE: 'Terasă',
          LIVE_MUSIC: 'Muzică live',
          PARKING: 'Parcare',
          WIFI: 'Wi-Fi',
          PET_FRIENDLY: 'Animale acceptate',
          FAMILY_FRIENDLY: 'Cu copii',
          RESERVATIONS: 'Rezervări',
        } as Record<string, string>,
      },
      hours: {
        title: 'Program',
        today: 'astăzi',
        dayOff: 'Închis',
        unavailable: 'Indisponibil',
        allDay: 'Non-stop',
        dayNames: {
          0: 'Duminică',
          1: 'Luni',
          2: 'Marți',
          3: 'Miercuri',
          4: 'Joi',
          5: 'Vineri',
          6: 'Sâmbătă',
        } as Record<number, string>,
      },
      address: {
        title: 'Adresă',
        missing: 'Adresa nu este specificată',
        mapLink: 'Deschide pe hartă',
      },
      socials: {
        title: 'Linkuri',
        website: 'Site',
        instagram: 'Instagram',
        facebook: 'Facebook',
        googleMaps: 'Google Maps',
      },
      contacts: {
        title: 'Contacte',
        phone: 'Telefon',
        email: 'Email',
      },
      externalRatings: {
        title: 'Recenzii online',
        sources: {
          google: 'Google Maps',
          tripadvisor: 'TripAdvisor',
          relax: 'Relax.md',
        } as Record<string, string>,
      },
      similar: {
        title: 'Restaurante similare',
        description: 'Alte localuri care ți-ar putea plăcea.',
        seeAll: 'Toate restaurantele',
      },
      floorPlan: {
        title: 'Planul sălii',
        description: 'Schema aranjării meselor. Pentru a alege data și masa liberă, mergi la rezervare.',
        reserveCta: 'Rezervă o masă',
        notConfigured: 'Planul sălii nu este încă configurat pentru acest local.',
        eyebrow: 'Prezentare · plan sală',
      },
      menu: {
        title: 'Fragment meniu',
        note: 'Exemplu de preparate — nu comandă online',
      },
      reviews: {
        title: 'Recenzii oaspeți',
      },
      actions: {
        reserveCta: 'Rezervă o masă',
        callCta: (phone: string) => `Sună · ${phone}`,
        callFallback: 'Sună la restaurant',
      },
    },
    footer: {
      description: 'Sistem de rezervare a meselor cu confirmare prin cod QR.',
      navTitle: 'Secțiuni',
      howItWorks: 'Cum funcționează',
      docsTitle: 'Documente',
      privacy: 'Politica de confidențialitate',
      terms: 'Termeni de utilizare',
      projectTitle: 'Proiect',
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}

