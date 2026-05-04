import type { RestaurantFeature } from '@prisma/client';
import {
  BabyIcon,
  CreditCardIcon,
  DogIcon,
  LeafIcon,
  MusicIcon,
  ShoppingBagIcon,
  ParkingCircleIcon,
  TruckIcon,
  WifiIcon,
  CalendarDaysIcon,
  type LucideIcon,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

const FEATURE_ICONS: Record<RestaurantFeature, LucideIcon> = {
  CARD_PAYMENT: CreditCardIcon,
  DELIVERY: TruckIcon,
  TAKEAWAY: ShoppingBagIcon,
  TERRACE: LeafIcon,
  LIVE_MUSIC: MusicIcon,
  PARKING: ParkingCircleIcon,
  WIFI: WifiIcon,
  PET_FRIENDLY: DogIcon,
  FAMILY_FRIENDLY: BabyIcon,
  RESERVATIONS: CalendarDaysIcon,
};

type RestaurantFeatureTagsProps = {
  features: RestaurantFeature[];
  locale: Locale;
};

export function RestaurantFeatureTags({ features, locale }: RestaurantFeatureTagsProps) {
  if (!features.length) return null;
  const t = getMessages(locale).restaurantDetail.features;

  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t.title}</h2>
      <ul className="flex flex-wrap gap-2">
        {features.map((feature) => {
          const Icon = FEATURE_ICONS[feature];
          const label = t.labels[feature] ?? feature;
          return (
            <li
              key={feature}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent-border/55 bg-accent-bg/60 px-3 py-1.5 text-xs font-medium text-accent-text"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
