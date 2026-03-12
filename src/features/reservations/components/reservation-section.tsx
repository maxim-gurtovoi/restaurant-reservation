'use client';

import { useState } from 'react';
import { FloorPlanView } from '@/features/floor-plan/components/floor-plan-view';
import { ReservationPanel } from '@/features/reservations/components/reservation-panel';

type ReservationSectionProps = {
  restaurantId: string;
  floorPlans: {
    id: string;
    name: string;
    width: number;
    height: number;
  }[];
  tables: {
    id: string;
    floorPlanId: string;
    label: string;
    capacity: number;
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isActive: boolean;
  }[];
};

export function ReservationSection({
  restaurantId,
  floorPlans,
  tables,
}: ReservationSectionProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedTable =
    tables.find((table) => table.id === selectedTableId) ?? null;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[2fr,1.2fr]">
      <FloorPlanView
        restaurantId={restaurantId}
        floorPlans={floorPlans}
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
      />
      <ReservationPanel
        selectedTable={
          selectedTable
            ? { label: selectedTable.label, capacity: selectedTable.capacity }
            : null
        }
      />
    </div>
  );
}

