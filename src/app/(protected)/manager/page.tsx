import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { requireManager } from '@/server/auth';
import {
  assignAdminToRestaurant,
  createRestaurantBasic,
  getManagerOverviewData,
  removeAdminAssignment,
} from '@/features/manager/server/manager.service';
import { formInputClass } from '@/lib/form-field-classes';
import { cn } from '@/lib/utils';

type ManagerPageProps = {
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

export default async function ManagerPage({ searchParams }: ManagerPageProps) {
  await requireManager();
  const [params, overview] = await Promise.all([searchParams, getManagerOverviewData()]);

  const flashError = getSingleParam(params, 'error');
  const flashOk = getSingleParam(params, 'ok');

  async function createRestaurantAction(formData: FormData) {
    'use server';
    await requireManager();

    const result = await createRestaurantBasic({
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      address: String(formData.get('address') ?? ''),
      description: String(formData.get('description') ?? ''),
      phone: String(formData.get('phone') ?? ''),
    });

    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=restaurant-created');
  }

  async function assignAdminAction(formData: FormData) {
    'use server';
    await requireManager();

    const result = await assignAdminToRestaurant({
      userId: String(formData.get('adminUserId') ?? ''),
      restaurantId: String(formData.get('restaurantId') ?? ''),
    });

    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=admin-assigned');
  }

  async function removeAdminAssignmentAction(formData: FormData) {
    'use server';
    await requireManager();

    const result = await removeAdminAssignment({
      linkId: String(formData.get('linkId') ?? ''),
    });
    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=admin-unassigned');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Панель управляющего"
        subtitle="Управление ресторанами и назначение администраторов зала (демо)."
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
              : flashOk === 'admin-unassigned'
                ? 'Назначение администратора снято.'
                : 'Назначение администратора сохранено.'}
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
          <h2 className="text-base font-semibold text-foreground">Назначить администратора зала</h2>
          <form action={assignAdminAction} className="space-y-3">
            <select
              name="adminUserId"
              className={formInputClass}
              required
            >
              <option value="">Выберите администратора</option>
              {overview.adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.email})
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
          <h2 className="text-base font-semibold text-foreground">Администраторы залов</h2>
          {overview.adminsOverview.length ? (
            <div className="space-y-2">
              {overview.adminsOverview.map((admin) => (
                <div key={admin.id} className="rounded-xl border border-border/60 bg-surface-soft p-3">
                  <p className="text-sm font-semibold text-foreground">{admin.name}</p>
                  <p className="text-xs text-muted">{admin.email}</p>
                  <p className="mt-1 text-xs text-foreground/85">
                    {admin.restaurants.length
                      ? `Назначен: ${admin.restaurants.join(', ')}`
                      : 'Ресторан не назначен'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Аккаунты администраторов не найдены.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Рестораны без администратора</h2>
          {overview.restaurantsWithoutAdmins.length ? (
            <div className="space-y-2">
              {overview.restaurantsWithoutAdmins.map((restaurant) => (
                <p key={restaurant.id} className="text-sm text-foreground">
                  {restaurant.name}{' '}
                  <span className="text-xs text-muted">({restaurant.isActive ? 'активен' : 'неактивен'})</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">У всех ресторанов уже есть администратор.</p>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Текущие связи администраторов</h2>
        {overview.adminLinks.length ? (
          <div className="space-y-2">
            {overview.adminLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-surface-soft p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-foreground">
                  {link.user.name} ({link.user.email}) {'->'} {link.restaurant.name}
                </p>
                <form action={removeAdminAssignmentAction}>
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
