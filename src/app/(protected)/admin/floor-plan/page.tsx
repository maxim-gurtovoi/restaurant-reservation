import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { requireAdmin } from '@/server/auth';

/**
 * Floor plan UI lives under `/manager/floor-plan`. Hall admins only need check-in / reservations in `/admin`.
 */
export default async function AdminFloorPlanRedirectPage() {
  const user = await requireAdmin();
  if (user.role === 'MANAGER') {
    redirect(ROUTES.managerFloorPlan);
  }
  redirect(ROUTES.adminDashboard);
}
