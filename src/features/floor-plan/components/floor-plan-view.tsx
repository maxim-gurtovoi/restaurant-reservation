'use client';
type FloorPlanViewProps = {
  restaurantId?: string;
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
  selectedTableId?: string | null;
  unavailableTableIds?: string[];
  onSelectTable?: (tableId: string) => void;
};

export function FloorPlanView({
  restaurantId,
  floorPlans,
  tables,
  selectedTableId,
  unavailableTableIds = [],
  onSelectTable,
}: FloorPlanViewProps) {
  if (!floorPlans.length || !tables.length) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
        <p>No floor plan is configured for this restaurant yet.</p>
      </div>
    );
  }

  const floorPlan = floorPlans[0];
  const planTables = tables.filter((t) => t.floorPlanId === floorPlan.id);

  if (!planTables.length) {
    return (
      <div className="space-y-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
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
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-slate-400">
          Floor plan: <span className="font-medium text-slate-200">{floorPlan.name}</span>
          {restaurantId ? ` · Restaurant ${restaurantId.slice(0, 8)}…` : null}
        </p>
        <p className="text-[10px] text-slate-500">
          Size: {floorPlan.width}×{floorPlan.height}
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-3"
          style={{ width: targetWidth, height: targetHeight }}>
          <div
            className="relative bg-slate-950/60"
            style={{
              width: floorPlan.width,
              height: floorPlan.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}>
            {planTables.map((table) => {
              const baseClasses =
                'absolute flex flex-col items-center justify-center text-[10px] font-medium transition-colors';

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
                // Inactive table
                stateClasses = 'border border-slate-700 bg-slate-900/40 text-slate-500 opacity-60';
              } else if (isUnavailable) {
                // Active but unavailable
                stateClasses = 'border border-red-500/60 bg-red-500/10 text-red-300 opacity-70';
              } else if (isSelected) {
                // Active, available, and selected
                stateClasses =
                  'border border-emerald-400 bg-emerald-500/30 text-emerald-50 shadow-lg shadow-emerald-500/30';
              } else {
                // Active and available
                stateClasses =
                  'border border-emerald-500/70 bg-emerald-500/10 text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/20 cursor-pointer';
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
                  <span className="text-[9px] font-normal text-slate-300/80">
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
