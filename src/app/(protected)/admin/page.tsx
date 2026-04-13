import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/server/auth';
import {
  assignManagerToRestaurant,
  createRestaurantBasic,
  getAdminOverviewData,
  removeManagerAssignment,
} from '@/features/admin/server/admin.service';
import { formInputClass } from '@/lib/form-field-classes';
import { cn } from '@/lib/utils';

type AdminPageProps = {
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const [params, overview] = await Promise.all([searchParams, getAdminOverviewData()]);

  const flashError = getSingleParam(params, 'error');
  const flashOk = getSingleParam(params, 'ok');

  async function createRestaurantAction(formData: FormData) {
    'use server';
    await requireAdmin();

    const result = await createRestaurantBasic({
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      address: String(formData.get('address') ?? ''),
      description: String(formData.get('description') ?? ''),
      phone: String(formData.get('phone') ?? ''),
    });

    if (!result.ok) {
      redirect(`/admin?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/admin?ok=restaurant-created');
  }

  async function assignManagerAction(formData: FormData) {
    'use server';
    await requireAdmin();

    const result = await assignManagerToRestaurant({
      userId: String(formData.get('managerUserId') ?? ''),
      restaurantId: String(formData.get('restaurantId') ?? ''),
    });

    if (!result.ok) {
      redirect(`/admin?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/admin?ok=manager-assigned');
  }

  async function removeManagerAssignmentAction(formData: FormData) {
    'use server';
    await requireAdmin();

    const result = await removeManagerAssignment({
      linkId: String(formData.get('linkId') ?? ''),
    });
    if (!result.ok) {
      redirect(`/admin?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/admin?ok=manager-unassigned');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Панель администратора"
        subtitle="Управление ресторанами и назначением менеджеров (демо)."
      />

      {flashError ? (
        <Card className="border-error/30 bg-error/5">
          <p className="text-sm text-error">{flashError}</p>
        </Card>
      ) : null}
      {flashOk ? (
        <Card className="border-primary/30 bg-primary/5">
          <p className="text-sm text-primary">
            {flashOk === 'restaurant-created'
              ? 'Ресторан успешно создан.'
              : flashOk === 'manager-unassigned'
                ? 'Назначение менеджера снято.'
                : 'Назначение менеджера сохранено.'}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Создать ресторан</h2>
          <form action={createRestaurantAction} className="space-y-3">
            <input
              name="name"
              placeholder="Название ресторана"
              className={formInputClass}
              required
            />
            <input
              name="slug"
              placeholder="slug-primer"
              className={formInputClass}
              required
            />
            <input
              name="address"
              placeholder="Адрес"
              className={formInputClass}
              required
            />
            <input
              name="phone"
              placeholder="Телефон (необязательно)"
              className={formInputClass}
            />
            <textarea
              name="description"
              placeholder="Краткое описание"
              className={cn(formInputClass, 'min-h-22 resize-y')}
              rows={3}
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover"
            >
              Создать ресторан
            </button>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Назначить менеджера</h2>
          <form action={assignManagerAction} className="space-y-3">
            <select
              name="managerUserId"
              className={formInputClass}
              required
            >
              <option value="">Выберите менеджера</option>
              {overview.managerUsers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
            <select
              name="restaurantId"
              className={formInputClass}
              required
            >
              <option value="">Выберите ресторан</option>
              {overview.restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover"
            >
              Назначить
            </button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Менеджеры</h2>
          {overview.managersOverview.length ? (
            <div className="space-y-2">
              {overview.managersOverview.map((manager) => (
                <div key={manager.id} className="rounded-xl border border-border/60 bg-surface-soft p-3">
                  <p className="text-sm font-semibold text-foreground">{manager.name}</p>
                  <p className="text-xs text-muted">{manager.email}</p>
                  <p className="mt-1 text-xs text-foreground/85">
                    {manager.restaurants.length
                      ? `Назначен: ${manager.restaurants.join(', ')}`
                      : 'Ресторан не назначен'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Аккаунты менеджеров не найдены.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Рестораны без менеджера</h2>
          {overview.restaurantsWithoutManagers.length ? (
            <div className="space-y-2">
              {overview.restaurantsWithoutManagers.map((restaurant) => (
                <p key={restaurant.id} className="text-sm text-foreground">
                  {restaurant.name}{' '}
                  <span className="text-xs text-muted">({restaurant.isActive ? 'активен' : 'неактивен'})</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">У всех ресторанов уже есть менеджер.</p>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Текущие связи менеджеров</h2>
        {overview.managerLinks.length ? (
          <div className="space-y-2">
            {overview.managerLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-surface-soft p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-foreground">
                  {link.user.name} ({link.user.email}) {'->'} {link.restaurant.name}
                </p>
                <form action={removeManagerAssignmentAction}>
                  <input type="hidden" name="linkId" value={link.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-error/35 bg-error/5 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                  >
                    Снять назначение
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Назначений пока нет.</p>
        )}
      </Card>
    </div>
  );
}

