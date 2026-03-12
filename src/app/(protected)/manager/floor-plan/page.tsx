import { PageHeader } from '@/components/ui/page-header';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';

export default function ManagerFloorPlanPage() {
  // TODO: load manager’s restaurantId from auth context
  return (
    <div className="space-y-6">
      <PageHeader title="Floor plan" subtitle="Monitor tables and upcoming reservations." />
      <FloorPlanView floorPlans={[]} tables={[]} />
    </div>
  );
}
