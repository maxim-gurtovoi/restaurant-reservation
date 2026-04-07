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
  /** Read-only overview (e.g. manager monitor) — no selection, neutral table styling */
  readOnly?: boolean;
  headerEyebrow?: string;
};

export function FloorPlanView({
  floorPlans,
  tables,
  selectedTableId,
  unavailableTableIds = [],
  onSelectTable,
  readOnly = false,
  headerEyebrow = 'Step 2 · Select a table',
}: FloorPlanViewProps) {
  if (!floorPlans.length || !tables.length) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
        <p>No floor plan is configured for this restaurant yet.</p>
      </div>
    );
  }

  const floorPlan = floorPlans[0];
  const planTables = tables.filter((t) => t.floorPlanId === floorPlan.id);

  if (!planTables.length) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
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
    <div className="space-y-3 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
            {headerEyebrow}
          </p>
          <p className="text-sm font-medium text-foreground">
            Floor plan: <span className="font-semibold">{floorPlan.name}</span>
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <div
          className="relative mx-auto shrink-0 rounded-2xl border border-border/50 bg-surface-soft p-3 shadow-card-soft"
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
                shapeClasses = 'rounded-lg';
              }

              const isSelected = selectedTableId === table.id;
              const isUnavailable = unavailableTableIds.includes(table.id);

              let stateClasses = '';
              if (readOnly) {
                if (!table.isActive) {
                  stateClasses =
                    'border border-dashed border-border/60 bg-surface-soft text-muted opacity-50 cursor-default';
                } else {
                  stateClasses =
                    'border border-border/60 bg-surface text-foreground/80 shadow-card-soft cursor-default';
                }
              } else if (!table.isActive) {
                stateClasses =
                  'border border-border/60 bg-surface-soft text-muted opacity-50 cursor-not-allowed';
              } else if (isUnavailable) {
                stateClasses =
                  'border border-error/35 bg-error/8 text-error opacity-80 cursor-not-allowed';
              } else if (isSelected) {
                stateClasses =
                  'border-2 border-accent-text bg-accent-bg text-accent-text shadow-md cursor-pointer scale-[1.05] font-semibold';
              } else {
                stateClasses =
                  'border border-accent-border/55 bg-accent-bg/70 text-accent-text hover:border-accent-border hover:bg-accent-bg hover:scale-[1.03] cursor-pointer shadow-card-soft';
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
                    if (readOnly || !table.isActive || isUnavailable || !onSelectTable) return;
                    onSelectTable(table.id);
                  }}>
                  <span>{table.label}</span>
                  <span className="text-[9px] font-normal opacity-70">
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
