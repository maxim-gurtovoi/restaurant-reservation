import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { getAdminFloorPlanContext } from '@/features/admin/server/admin.service';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { requireAdmin } from '@/server/auth';

type AdminFloorPlanPageProps = {
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

export default async function AdminFloorPlanPage({
  searchParams,
}: AdminFloorPlanPageProps) {
  const user = await requireAdmin();
  const params = await searchParams;
  const restaurantId = getSingleParam(params, 'restaurantId');
  const ctx = await getAdminFloorPlanContext({
    adminUserId: user.id,
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
            К вашему аккаунту не привязаны рестораны. Используйте тестовый аккаунт администратора
            зала из сидов или попросите управляющего назначить вас на ресторан.
          </p>
        </div>
      </div>
    );
  }

  const canEdit = user.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <PageHeader
        title="План зала"
        subtitle={
          canEdit
            ? 'Обзор плана. Управляющий может открыть drag&drop редактор для выбранного зала.'
            : 'Только просмотр: столы и вместимость выбранного заведения.'
        }
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
                  href={`${ROUTES.adminFloorPlan}?restaurantId=${encodeURIComponent(r.id)}`}
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

      {canEdit && ctx.floorPlans.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent-border/50 bg-accent-bg/40 px-3 py-2 text-sm text-accent-text">
          <span className="font-medium">Режим управляющего:</span>
          <span className="text-foreground/75">
            откройте drag&amp;drop редактор для любого из планов
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            {ctx.floorPlans.map((fp) => (
              <Link
                key={fp.id}
                href={`${ROUTES.managerFloorPlanEdit}/${fp.id}/edit`}
                className="rounded-lg border border-accent-border/60 bg-surface px-3 py-1 text-xs font-medium text-accent-text hover:border-accent-text hover:bg-accent-bg/80"
              >
                Редактировать «{fp.name}»
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <FloorPlanView
        floorPlans={ctx.floorPlans}
        tables={ctx.tables}
        elements={ctx.elements}
        readOnly
        headerEyebrow="Обзор · план зала"
      />
    </div>
  );
}
