import { PageHeader } from '@/components/ui/page-header';
import { ManagerDashboard } from '@/features/manager/components/manager-dashboard';
import { requireManager } from '@/server/auth';
import { getManagerDashboardStats } from '@/features/manager/server/manager.service';

export default async function ManagerDashboardPage() {
  const manager = await requireManager();
  const stats = await getManagerDashboardStats({ managerUserId: manager.id });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of today’s reservations and check-ins."
      />
      <ManagerDashboard stats={stats} />
    </div>
  );
}

