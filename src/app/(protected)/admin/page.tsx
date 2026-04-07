import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/server/auth';
import {
  assignManagerToRestaurant,
  createRestaurantBasic,
  getAdminOverviewData,
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Console"
        subtitle="Manage restaurants and manager assignments for the demo."
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
              ? 'Restaurant created successfully.'
              : 'Manager assignment saved successfully.'}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Create restaurant</h2>
          <form action={createRestaurantAction} className="space-y-3">
            <input
              name="name"
              placeholder="Restaurant name"
              className={formInputClass}
              required
            />
            <input
              name="slug"
              placeholder="slug-example"
              className={formInputClass}
              required
            />
            <input
              name="address"
              placeholder="Address"
              className={formInputClass}
              required
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className={formInputClass}
            />
            <textarea
              name="description"
              placeholder="Short description"
              className={cn(formInputClass, 'min-h-[5.5rem] resize-y')}
              rows={3}
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover"
            >
              Create restaurant
            </button>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Assign manager</h2>
          <form action={assignManagerAction} className="space-y-3">
            <select
              name="managerUserId"
              className={formInputClass}
              required
            >
              <option value="">Select manager</option>
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
              <option value="">Select restaurant</option>
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
              Assign manager
            </button>
          </form>
        </Card>
      </div>

      <Card className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Current manager links</h2>
        {overview.managerLinks.length ? (
          <div className="space-y-1.5">
            {overview.managerLinks.map((link) => (
              <p key={link.id} className="text-sm text-foreground">
                {link.user.name} {'->'} {link.restaurant.name}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No manager assignments yet.</p>
        )}
      </Card>
    </div>
  );
}

