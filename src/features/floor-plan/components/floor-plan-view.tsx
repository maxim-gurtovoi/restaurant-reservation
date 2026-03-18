'use client';
import type { TableShape } from '@prisma/client';

type FloorPlanViewProps = {
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
    shape: TableShape;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    isActive: boolean;
  }[];
  selectedTableId?: string | null;
  unavailableTableIds?: string[];
  onSelectTable?: (tableId: string) => void;
};

export function FloorPlanView({
  floorPlans,
  tables,
  selectedTableId,
  unavailableTableIds = [],
  onSelectTable,
}: FloorPlanViewProps) {
  if (!floorPlans.length || !tables.length) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <p>No floor plan is configured for this restaurant yet.</p>
      </div>
    );
  }

  const floorPlan = floorPlans[0];
  const planTables = tables.filter((t) => t.floorPlanId === floorPlan.id);

  if (!planTables.length) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        <p>This floor plan does not have any tables yet.</p>
      </div>
    );
  }

  const targetWidth = 640;
  const targetHeight = 400;
  const scaleX = targetWidth / floorPlan.width;
  const scaleY = targetHeight / floorPlan.height;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Step 2 · Select a table
          </p>
          <p className="text-sm font-medium text-gray-900">
            Floor plan: <span className="font-semibold">{floorPlan.name}</span>
          </p>
        </div>
      </div>

      <div className="flex">
        <div
          className="relative mx-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          style={{ width: targetWidth, height: targetHeight }}>
          <div
            className="relative bg-transparent"
            style={{
              width: floorPlan.width,
              height: floorPlan.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}>
            {planTables.map((table) => {
              const baseClasses =
                'absolute flex flex-col items-center justify-center text-[10px] font-medium transition-colors transition-transform';

              let shapeClasses = '';
              if (table.shape === 'ROUND') {
                shapeClasses = 'rounded-full';
              } else if (table.shape === 'SQUARE') {
                shapeClasses = 'rounded-md';
              } else {
                // RECTANGLE or any other
                shapeClasses = 'rounded-lg';
              }

              const isSelected = selectedTableId === table.id;
              const isUnavailable = unavailableTableIds.includes(table.id);

              let stateClasses = '';
              if (!table.isActive) {
                stateClasses = 'border border-gray-300 bg-gray-200 text-gray-500 opacity-60';
              } else if (isUnavailable) {
                stateClasses = 'border border-red-300 bg-red-50 text-red-600 opacity-80';
              } else if (isSelected) {
                stateClasses =
                  'border-2 border-[#107c41] bg-[#107c41]/15 text-[#0d6b36] shadow-md cursor-pointer scale-[1.04]';
              } else {
                stateClasses =
                  'border border-[#107c41]/50 bg-[#107c41]/5 text-gray-800 hover:border-[#107c41] hover:bg-[#107c41]/10 hover:scale-[1.02] cursor-pointer';
              }

              return (
                <div
                  key={table.id}
                  className={`${baseClasses} ${shapeClasses} ${stateClasses}`}
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.width,
                    height: table.height,
                    transform: `rotate(${table.rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                  onClick={() => {
                    if (!table.isActive || isUnavailable || !onSelectTable) return;
                    onSelectTable(table.id);
                  }}>
                  <span>{table.label}</span>
                  <span className="text-[9px] font-normal text-gray-500">
                    {table.capacity} seats
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
