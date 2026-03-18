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
      <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted">
        <p>No floor plan is configured for this restaurant yet.</p>
      </div>
    );
  }

  const floorPlan = floorPlans[0];
  const planTables = tables.filter((t) => t.floorPlanId === floorPlan.id);

  if (!planTables.length) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted">
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
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Step 2 · Select a table
          </p>
          <p className="text-sm font-medium text-foreground">
            Floor plan: <span className="font-semibold">{floorPlan.name}</span>
          </p>
        </div>
      </div>

      <div className="flex">
        <div
          className="relative mx-auto rounded-xl border border-border bg-surface p-3 shadow-sm"
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
                stateClasses =
                  'border border-border bg-background text-muted opacity-60 cursor-not-allowed';
              } else if (isUnavailable) {
                stateClasses =
                  'border border-error bg-error/10 text-error opacity-80 cursor-not-allowed';
              } else if (isSelected) {
                stateClasses =
                  'border-2 border-primary bg-primary/18 text-primary-hover shadow-md cursor-pointer scale-[1.05] font-semibold';
              } else {
                stateClasses =
                  'border border-primary/50 bg-primary/5 text-foreground/90 hover:border-primary hover:bg-primary/10 hover:scale-[1.03] cursor-pointer';
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
                  <span className="text-[9px] font-normal text-muted">
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
