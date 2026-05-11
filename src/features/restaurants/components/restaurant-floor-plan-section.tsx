import Link from 'next/link';
import type {
  FloorPlanViewElement,
  FloorPlanViewFloor,
  FloorPlanViewTable,
} from '@/features/floor-plan/components/floor-plan-view';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

type RestaurantFloorPlanSectionProps = {
  floorPlans: FloorPlanViewFloor[];
  tables: FloorPlanViewTable[];
  floorPlanElements: FloorPlanViewElement[];
  reserveHref: string;
  locale: Locale;
};

export function RestaurantFloorPlanSection({
  floorPlans,
  tables,
  floorPlanElements,
  reserveHref,
  locale,
}: RestaurantFloorPlanSectionProps) {
  const t = getMessages(locale).restaurantDetail.floorPlan;
  const hasFloorData = floorPlans.length > 0 && tables.length > 0;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{t.title}</h2>
          <p className="text-sm text-muted">{t.description}</p>
        </div>
        <Button asChild variant="primary" className="w-full shrink-0 sm:w-auto">
          <Link href={reserveHref}>{t.reserveCta}</Link>
        </Button>
      </header>

      {hasFloorData ? (
        <FloorPlanView
          floorPlans={floorPlans}
          tables={tables}
          elements={floorPlanElements}
          readOnly
          headerEyebrow={t.eyebrow}
          layoutScale={0.5}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
          {t.notConfigured}
        </div>
      )}
    </section>
  );
}
