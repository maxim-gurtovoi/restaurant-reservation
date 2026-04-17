import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { getManagerFloorPlanContext } from '@/features/manager/server/manager.service';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { requireManager } from '@/server/auth';

type ManagerFloorPlanPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default async function ManagerFloorPlanPage({
  searchParams,
}: ManagerFloorPlanPageProps) {
  const user = await requireManager();
  const params = await searchParams;
  const restaurantId = getSingleParam(params, 'restaurantId');
  const ctx = await getManagerFloorPlanContext({
    managerUserId: user.id,
    restaurantId,
  });

  if (!ctx.restaurants.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="План зала"
          subtitle="Схема столов и зала для ваших заведений."
        />
        <div className="space-y-2 rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted shadow-sm">
          <p>
            К вашему аккаунту менеджера не привязаны рестораны. Используйте тестового менеджера из сидов
            или попросите администратора назначить вас на ресторан.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="План зала"
        subtitle="Только просмотр: столы и вместимость выбранного заведения."
      />

      {ctx.restaurants.length > 1 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Заведение
          </p>
          <div className="flex flex-wrap gap-2">
            {ctx.restaurants.map((r) => {
              const selected = ctx.restaurant?.id === r.id;
              return (
                <Link
                  key={r.id}
                  href={`${ROUTES.managerFloorPlan}?restaurantId=${encodeURIComponent(r.id)}`}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface text-foreground hover:border-primary/40',
                  )}>
                  {r.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <FloorPlanView
        floorPlans={ctx.floorPlans}
        tables={ctx.tables}
        readOnly
        headerEyebrow="Обзор · план зала"
        restaurantSlug={ctx.restaurant?.slug}
      />
    </div>
  );
}
