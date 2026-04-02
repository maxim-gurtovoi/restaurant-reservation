import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/server/auth';
import {
  assignManagerToRestaurant,
  createRestaurantBasic,
  getAdminOverviewData,
} from '@/features/admin/server/admin.service';

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
        <Card className="border-red-300 bg-red-50">
          <p className="text-sm text-red-700">{flashError}</p>
        </Card>
      ) : null}
      {flashOk ? (
        <Card className="border-emerald-300 bg-emerald-50">
          <p className="text-sm text-emerald-700">
            {flashOk === 'restaurant-created'
              ? 'Restaurant created successfully.'
              : 'Manager assignment saved successfully.'}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Create restaurant</h2>
          <form action={createRestaurantAction} className="space-y-3">
            <input
              name="name"
              placeholder="Restaurant name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="slug"
              placeholder="slug-example"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="address"
              placeholder="Address"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              placeholder="Short description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Create restaurant
            </button>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Assign manager</h2>
          <form action={assignManagerAction} className="space-y-3">
            <select
              name="managerUserId"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Assign manager
            </button>
          </form>
        </Card>
      </div>

      <Card className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900">Current manager links</h2>
        {overview.managerLinks.length ? (
          <div className="space-y-1.5">
            {overview.managerLinks.map((link) => (
              <p key={link.id} className="text-sm text-gray-700">
                {link.user.name} {'->'} {link.restaurant.name}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No manager assignments yet.</p>
        )}
      </Card>
    </div>
  );
}

