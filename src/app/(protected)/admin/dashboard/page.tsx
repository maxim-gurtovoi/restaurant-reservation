import { PageHeader } from '@/components/ui/page-header';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { requireAdmin } from '@/server/auth';
import { getAdminDashboardStats } from '@/features/admin/server/admin.service';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getAdminDashboardStats({ adminUserId: admin.id });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Обзор"
        subtitle="Ключевые цифры и графики по вашим ресторанам."
      />
      <AdminDashboard stats={stats} />
    </div>
  );
}
