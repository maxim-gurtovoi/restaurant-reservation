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
        title="Обзор"
        subtitle="Сводка по броням и заселениям за сегодня."
      />
      <ManagerDashboard stats={stats} />
    </div>
  );
}

