import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import {
  requireManager,
  requireManagerShell,
  requireOwner,
} from '@/server/auth';
import {
  assignAdminToRestaurant,
  createRestaurantBasic,
  getManagerOverviewData,
  removeAdminAssignment,
  updateBookingRules,
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
  const user = await requireManagerShell();
  const [params, overview] = await Promise.all([
    searchParams,
    getManagerOverviewData({ userId: user.id, role: user.role }),
  ]);

  const flashError = getSingleParam(params, 'error');
  const flashOk = getSingleParam(params, 'ok');
  const isOwner = user.role === 'OWNER';
  const isManager = user.role === 'MANAGER';
  const managedId = overview.restaurants[0]?.id;

  async function createRestaurantAction(formData: FormData) {
    'use server';
    const actor = await requireOwner();

    const result = await createRestaurantBasic(
      {
        name: String(formData.get('name') ?? ''),
        slug: String(formData.get('slug') ?? ''),
        address: String(formData.get('address') ?? ''),
        description: String(formData.get('description') ?? ''),
        phone: String(formData.get('phone') ?? ''),
      },
      { role: actor.role },
    );

    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=restaurant-created');
  }

  async function assignAdminAction(formData: FormData) {
    'use server';
    const actor = await requireManager();

    const result = await assignAdminToRestaurant(
      {
        userId: String(formData.get('adminUserId') ?? ''),
        restaurantId: String(formData.get('restaurantId') ?? ''),
      },
      { userId: actor.id, role: actor.role },
    );

    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=admin-assigned');
  }

  async function removeAdminAssignmentAction(formData: FormData) {
    'use server';
    const actor = await requireManager();

    const result = await removeAdminAssignment(
      {
        linkId: String(formData.get('linkId') ?? ''),
      },
      { userId: actor.id, role: actor.role },
    );
    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=admin-unassigned');
  }

  async function updateBookingRulesAction(formData: FormData) {
    'use server';
    const actor = await requireManager();

    const leadStr = String(formData.get('minBookingLeadMinutes') ?? '').trim();
    const maxStr = String(formData.get('maxGuestsWithoutPhone') ?? '').trim();
    const blockedStr = String(formData.get('blockedRecurrenceJson') ?? '');

    const minBookingLeadMinutes = leadStr === '' ? null : Number(leadStr);
    const maxGuestsWithoutPhone = maxStr === '' ? null : Number(maxStr);

    const result = await updateBookingRules(
      {
        minBookingLeadMinutes,
        maxGuestsWithoutPhone,
        blockedRecurrenceJson: blockedStr,
      },
      { userId: actor.id, role: actor.role },
    );

    if (!result.ok) {
      redirect(`/manager?error=${encodeURIComponent(result.error)}`);
    }
    redirect('/manager?ok=booking-rules');
  }

  const headerTitle = isOwner ? 'Панель владельца платформы' : 'Панель управляющего';
  const headerSubtitle = isOwner
    ? 'Создание ресторанов и обзор назначений по всей платформе.'
    : 'Управление администраторами зала в рамках вашего ресторана.';

  return (
    <div className="space-y-6">
      <PageHeader title={headerTitle} subtitle={headerSubtitle} />

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
                : flashOk === 'booking-rules'
                  ? 'Правила бронирования сохранены.'
                  : 'Назначение администратора сохранено.'}
          </p>
        </Card>
      ) : null}

      {isManager && !managedId ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-foreground">
            Ваш аккаунт не привязан к ресторану (поле «Управляющий» в данных ресторана). Обратитесь к
            владельцу платформы.
          </p>
        </Card>
      ) : null}

      {isOwner ? (
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
              <input name="slug" placeholder="slug-primer" className={formInputClass} required />
              <input name="address" placeholder="Адрес" className={formInputClass} required />
              <input name="phone" placeholder="Телефон (необязательно)" className={formInputClass} />
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
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      ) : null}

      {isManager && managedId ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <Card className="h-full space-y-3">
              <h2 className="text-base font-semibold text-foreground">Администраторы залов</h2>
              {overview.adminsOverview.length ? (
                <div className="space-y-2">
                  {overview.adminsOverview.map((admin) => (
                    <div
                      key={admin.id}
                      className="rounded-xl border border-border/60 bg-surface-soft p-3"
                    >
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
            <Card className="h-full space-y-3">
              <h2 className="text-base font-semibold text-foreground">Назначить администратора зала</h2>
              <form action={assignAdminAction} className="space-y-3">
                <select name="adminUserId" className={formInputClass} required>
                  <option value="">Выберите администратора</option>
                  {overview.adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))}
                </select>
                <input type="hidden" name="restaurantId" value={managedId} />
                <p className="text-xs text-muted">
                  Ресторан:{' '}
                  <span className="font-medium text-foreground">{overview.restaurants[0]?.name}</span>
                </p>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover"
                >
                  Назначить
                </button>
              </form>
            </Card>
          </div>

          {overview.managedRestaurant ? (
            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">Правила бронирования</h2>
              <p className="text-xs text-muted">
                Пустое поле минимального запаса — использовать общий дефолт платформы. JSON окон:
                массив объектов{' '}
                <code className="rounded bg-surface-soft px-1">
                  dayOfWeek (0–6), startHHmm, endHHmm
                </code>{' '}
                — как в графике работы.
              </p>
              <form action={updateBookingRulesAction} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-foreground">Мин. запас до визита (минуты)</span>
                  <input
                    name="minBookingLeadMinutes"
                    type="number"
                    min={0}
                    max={1440}
                    step={1}
                    placeholder="По умолчанию платформы"
                    className={formInputClass}
                    defaultValue={
                      overview.managedRestaurant.minBookingLeadMinutes ?? ''
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-foreground">
                    Без телефона — максимум гостей
                  </span>
                  <input
                    name="maxGuestsWithoutPhone"
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    placeholder="Напр. 6; пусто — как на платформе"
                    className={formInputClass}
                    defaultValue={
                      overview.managedRestaurant.maxGuestsWithoutPhone ?? ''
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-foreground">
                    Заблокированные повторяющиеся окна (JSON)
                  </span>
                  <textarea
                    name="blockedRecurrenceJson"
                    rows={6}
                    className={cn(formInputClass, 'min-h-32 resize-y font-mono text-xs')}
                    placeholder='[{"dayOfWeek":5,"startHHmm":"18:00","endHHmm":"21:00"}]'
                    defaultValue={
                      overview.managedRestaurant.blockedRecurrenceJson != null
                        ? JSON.stringify(overview.managedRestaurant.blockedRecurrenceJson, null, 2)
                        : ''
                    }
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover"
                >
                  Сохранить правила
                </button>
              </form>
            </Card>
          ) : null}
        </>
      ) : (
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
      )}

      {isOwner && overview.restaurantsWithoutManagers.length ? (
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Рестораны без управляющего</h2>
          <div className="space-y-2">
            {overview.restaurantsWithoutManagers.map((restaurant) => (
              <p key={restaurant.id} className="text-sm text-foreground">
                {restaurant.name}{' '}
                <span className="text-xs text-muted">
                  ({restaurant.isActive ? 'активен' : 'неактивен'})
                </span>
              </p>
            ))}
          </div>
        </Card>
      ) : null}

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
                {isManager ? (
                  <form action={removeAdminAssignmentAction}>
                    <input type="hidden" name="linkId" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-error/35 bg-error/5 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                    >
                      Снять назначение
                    </button>
                  </form>
                ) : null}
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
