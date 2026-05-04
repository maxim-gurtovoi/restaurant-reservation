import Link from 'next/link';
import {
  CameraIcon,
  ClockIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  MapIcon,
  PhoneIcon,
  StarIcon,
  UsersIcon,
  UsersRoundIcon,
  UtensilsIcon,
  type LucideIcon,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { Button } from '@/components/ui/button';
import type { OpenStatus, WeeklyRow } from '@/features/restaurants/lib/open-status';
import { cn } from '@/lib/utils';

function normalizePhone(phone: string): string {
  return phone.replace(/[^+\d]/g, '');
}

function priceTierToGlyphs(level: number | null): string | null {
  if (!level) return null;
  const clamped = Math.min(4, Math.max(1, level));
  return '\u20B4'.repeat(clamped);
}

// ───── Actions (Reserve + Call + status) ─────────────────────────────────────

type RestaurantActionsCardProps = {
  reserveHref: string;
  phone: string | null;
  openStatus: OpenStatus;
  locale: Locale;
};

export function RestaurantActionsCard({
  reserveHref,
  phone,
  openStatus,
  locale,
}: RestaurantActionsCardProps) {
  const t = getMessages(locale).restaurantDetail;
  const toneClass =
    openStatus.tone === 'open'
      ? 'text-emerald-600'
      : openStatus.tone === 'closed'
        ? 'text-error'
        : 'text-muted';
  const dotClass =
    openStatus.tone === 'open'
      ? 'bg-emerald-500'
      : openStatus.tone === 'closed'
        ? 'bg-error'
        : 'bg-muted';

  return (
    <div className="space-y-3 rounded-2xl border border-border/50 bg-surface p-4 shadow-card">
      <Button asChild variant="primary" className="w-full py-2.5 text-sm font-semibold">
        <Link href={reserveHref}>{t.actions.reserveCta}</Link>
      </Button>
      {phone ? (
        <a
          href={`tel:${normalizePhone(phone)}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/40 hover:bg-surface-soft"
        >
          <PhoneIcon className="h-4 w-4" aria-hidden="true" />
          {t.actions.callCta(phone)}
        </a>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/55 bg-surface-soft/60 px-4 py-2.5 text-sm font-medium text-muted">
          <PhoneIcon className="h-4 w-4" aria-hidden="true" />
          {t.actions.callFallback}
        </div>
      )}
      <p
        className={cn(
          'flex items-center gap-2 pl-2.5 text-xs font-medium',
          toneClass,
        )}
      >
        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
        {openStatus.label}
      </p>
    </div>
  );
}

// ───── Quick facts (cuisine / price / rating / capacity) ─────────────────────

type RestaurantQuickFactsCardProps = {
  cuisine: string | null;
  priceLevel: number | null;
  rating: number | null;
  reviewsCount: number;
  seatsTotal: number;
  floorsCount: number;
  locale: Locale;
};

type FactRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
};

export function RestaurantQuickFactsCard({
  cuisine,
  priceLevel,
  rating,
  reviewsCount,
  seatsTotal,
  floorsCount,
  locale,
}: RestaurantQuickFactsCardProps) {
  const t = getMessages(locale).restaurantDetail;
  const priceGlyphs = priceTierToGlyphs(priceLevel);

  const rows: FactRow[] = [];
  if (cuisine) {
    rows.push({ icon: UtensilsIcon, label: t.quickFacts.cuisine, value: cuisine });
  }
  if (priceGlyphs) {
    rows.push({
      icon: GlobeIcon,
      label: t.quickFacts.priceTier,
      value: priceGlyphs,
      hint: priceLevel ? t.price.hint(priceLevel) : undefined,
    });
  }
  if (rating !== null) {
    rows.push({
      icon: StarIcon,
      label: t.quickFacts.rating,
      value: `${rating.toFixed(1)} / 5`,
      hint: t.hero.reviews(reviewsCount),
    });
  }
  if (seatsTotal > 0) {
    rows.push({
      icon: UsersIcon,
      label: t.quickFacts.capacity,
      value: t.quickFacts.capacityValue(seatsTotal),
      hint: floorsCount > 0 ? t.quickFacts.floorsValue(floorsCount) : undefined,
    });
  }

  if (!rows.length) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-4 shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">
        {t.quickFacts.title}
      </h3>
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-bg/60 text-accent-text">
              <row.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {row.label}
              </dt>
              <dd className="truncate text-sm font-medium text-foreground">{row.value}</dd>
              {row.hint ? <p className="text-[11px] text-muted">{row.hint}</p> : null}
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ───── Address ───────────────────────────────────────────────────────────────

type RestaurantAddressCardProps = {
  address: string | null;
  googleMapsUrl: string | null;
  locale: Locale;
};

export function RestaurantAddressCard({
  address,
  googleMapsUrl,
  locale,
}: RestaurantAddressCardProps) {
  const t = getMessages(locale).restaurantDetail;
  const mapHref = googleMapsUrl ?? (address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null);

  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-4 shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">
        {t.address.title}
      </h3>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-bg/60 text-accent-text">
          <MapPinIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="wrap-break-word text-sm text-foreground">{address ?? t.address.missing}</p>
      </div>
      {mapHref ? (
        <a
          href={mapHref}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {t.address.mapLink}
        </a>
      ) : null}
    </section>
  );
}

// ───── Working hours ─────────────────────────────────────────────────────────

type RestaurantWorkingHoursCardProps = {
  rows: WeeklyRow[];
  locale: Locale;
};

export function RestaurantWorkingHoursCard({ rows, locale }: RestaurantWorkingHoursCardProps) {
  const t = getMessages(locale).restaurantDetail;
  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-4 shadow-card">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-text">
        <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {t.hours.title}
      </h3>
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.dayOfWeek}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm',
              row.isToday && 'border border-accent-border/40 bg-accent-bg/45',
            )}
            aria-current={row.isToday ? 'date' : undefined}
          >
            <span className={row.isToday ? 'font-semibold text-accent-text' : 'text-muted'}>
              {row.label}
            </span>
            <span className={row.isEmphasized ? 'text-foreground' : 'text-muted'}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───── Social / external links ───────────────────────────────────────────────

type RestaurantSocialLinksCardProps = {
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  googleMapsUrl: string | null;
  phone: string | null;
  email: string | null;
  locale: Locale;
};

type SocialLink = {
  href: string;
  label: string;
  value: string;
  icon: LucideIcon;
  external?: boolean;
};

export function RestaurantSocialLinksCard({
  websiteUrl,
  instagramUrl,
  facebookUrl,
  googleMapsUrl,
  phone,
  email,
  locale,
}: RestaurantSocialLinksCardProps) {
  const t = getMessages(locale).restaurantDetail;
  const links: SocialLink[] = [];

  if (websiteUrl) {
    links.push({
      href: websiteUrl,
      label: t.socials.website,
      value: websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      icon: GlobeIcon,
      external: true,
    });
  }
  if (instagramUrl) {
    links.push({
      href: instagramUrl,
      label: t.socials.instagram,
      value: instagramUrl.split('/').filter(Boolean).pop() ?? 'Instagram',
      icon: CameraIcon,
      external: true,
    });
  }
  if (facebookUrl) {
    links.push({
      href: facebookUrl,
      label: t.socials.facebook,
      value: facebookUrl.split('/').filter(Boolean).pop() ?? 'Facebook',
      icon: UsersRoundIcon,
      external: true,
    });
  }
  if (googleMapsUrl) {
    links.push({
      href: googleMapsUrl,
      label: t.socials.googleMaps,
      value: 'maps.google.com',
      icon: MapIcon,
      external: true,
    });
  }
  if (phone) {
    links.push({
      href: `tel:${normalizePhone(phone)}`,
      label: t.contacts.phone,
      value: phone,
      icon: PhoneIcon,
    });
  }
  if (email) {
    links.push({
      href: `mailto:${email}`,
      label: t.contacts.email,
      value: email,
      icon: MailIcon,
    });
  }

  if (!links.length) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-surface p-4 shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-text">
        {t.socials.title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer noopener' : undefined}
              className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm text-foreground transition hover:bg-accent-bg/50"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-bg/60 text-accent-text">
                <link.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {link.label}
                </span>
                <span className="truncate text-sm font-medium text-foreground">{link.value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
