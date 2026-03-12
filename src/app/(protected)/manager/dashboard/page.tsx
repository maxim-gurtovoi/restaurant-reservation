import { PageHeader } from '@/components/ui/page-header';
import { ManagerDashboard } from '@/features/manager/components/manager-dashboard';

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of today’s reservations and check-ins."
      />
      <ManagerDashboard />
    </div>
  );
}

