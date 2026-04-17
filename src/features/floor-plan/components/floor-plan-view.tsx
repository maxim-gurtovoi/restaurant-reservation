'use client';

import { useState } from 'react';
import type { TableShape } from '@prisma/client';
import { getVisualZonesForFloor } from '@/features/floor-plan/data/visual-zones';
import { cn } from '@/lib/utils';

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
  /** Used to show optional demo zone labels when coordinates match seeded layouts */
  restaurantSlug?: string;
};

export function FloorPlanView({
  floorPlans,
  tables,
  selectedTableId,
  unavailableTableIds = [],
  onSelectTable,
  readOnly = false,
  headerEyebrow = 'Шаг 2 · Выберите столик',
  restaurantSlug,
}: FloorPlanViewProps) {
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);

  if (!floorPlans.length || !tables.length) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
        <p>Для этого ресторана ещё не настроен план зала.</p>
      </div>
    );
  }

  const floorPlan = floorPlans[0];
  const planTables = tables.filter((t) => t.floorPlanId === floorPlan.id);

  if (!planTables.length) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
        <p>На этом плане зала пока нет столиков.</p>
      </div>
    );
  }

  const visualZones = restaurantSlug
    ? getVisualZonesForFloor(restaurantSlug, floorPlan.width, floorPlan.height)
    : [];

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
            План зала: <span className="font-semibold">{floorPlan.name}</span>
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <div
          className="relative mx-auto shrink-0 rounded-2xl border border-border/50 bg-[linear-gradient(180deg,rgba(250,248,245,0.96)_0%,rgba(240,236,228,0.98)_100%)] p-3 shadow-card-soft dark:bg-[linear-gradient(180deg,rgba(28,26,24,0.96)_0%,rgba(22,20,18,0.98)_100%)]"
          style={{ width: targetWidth, height: targetHeight }}>
          <div
            className="relative overflow-hidden rounded-xl ring-1 ring-border/40"
            style={{
              width: floorPlan.width,
              height: floorPlan.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundImage: [
                'linear-gradient(90deg,rgba(120,100,80,0.06)_1px,transparent 1px)',
                'linear-gradient(rgba(120,100,80,0.06)_1px,transparent 1px)',
              ].join(','),
              backgroundSize: '32px 32px',
              backgroundColor: 'rgba(255,252,247,0.35)',
            }}>
            {visualZones.map((zone) => (
              <div
                key={`${zone.label}-${zone.x}-${zone.y}`}
                className="pointer-events-none absolute rounded-lg border border-dashed border-foreground/10 bg-foreground/3"
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                }}>
                <span className="absolute left-2 top-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
                  {zone.label}
                </span>
              </div>
            ))}

            {planTables.map((table) => {
              const isSelected = selectedTableId === table.id;
              const isUnavailable = unavailableTableIds.includes(table.id);
              const isHovered = hoveredTableId === table.id && !readOnly;

              let hoverOrSelectScale = 1;
              if (!readOnly && table.isActive && !isUnavailable) {
                if (isSelected) hoverOrSelectScale = 1.06;
                else if (isHovered) hoverOrSelectScale = 1.035;
              }

              const transform = `rotate(${table.rotation}deg) scale(${hoverOrSelectScale})`;

              const shapeOutline =
                table.shape === 'ROUND'
                  ? 'rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                  : table.shape === 'SQUARE'
                    ? 'rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                    : 'rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]';

              const shapeSizeAccent =
                table.shape === 'ROUND'
                  ? 'border-[2.5px]'
                  : table.shape === 'SQUARE'
                    ? 'border-2'
                    : 'border-2 border-b-[3px]';

              let stateClasses = '';
              if (readOnly) {
                if (!table.isActive) {
                  stateClasses =
                    'border-dashed border-border/50 bg-surface-soft/80 text-muted opacity-50 cursor-default';
                } else {
                  stateClasses =
                    'border-border/55 bg-surface/90 text-foreground/85 cursor-default shadow-sm';
                }
              } else if (!table.isActive) {
                stateClasses =
                  'border-border/50 bg-surface-soft text-muted opacity-45 cursor-not-allowed grayscale';
              } else if (isUnavailable) {
                stateClasses = cn(
                  'cursor-not-allowed border-border/40 bg-surface-soft/90 text-muted',
                  'opacity-50 grayscale-[0.4]',
                );
              } else if (isSelected) {
                stateClasses = cn(
                  'z-10 cursor-pointer border-accent-text bg-accent-bg text-accent-text',
                  'shadow-[0_0_0_3px_rgba(123,47,155,0.35),0_8px_22px_rgba(28,28,28,0.12)]',
                  'font-semibold ring-2 ring-accent-text/90',
                );
              } else {
                stateClasses = cn(
                  'cursor-pointer border-accent-border/60 bg-accent-bg/55 text-accent-text',
                  'shadow-card-soft hover:border-accent-border hover:bg-accent-bg/80',
                );
              }

              const baseClasses =
                'absolute flex flex-col items-center justify-center text-[10px] font-medium transition-[transform,box-shadow,background-color,border-color] duration-150 ease-out';

              return (
                <div
                  key={table.id}
                  className="absolute"
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.width,
                    height: table.height,
                    transformOrigin: 'center',
                  }}>
                  <button
                    type="button"
                    disabled={readOnly || !table.isActive || isUnavailable || !onSelectTable}
                    className={cn(
                      baseClasses,
                      shapeOutline,
                      shapeSizeAccent,
                      stateClasses,
                      'h-full w-full select-none',
                    )}
                    style={{ transform, transformOrigin: 'center' }}
                    onClick={() => {
                      if (readOnly || !table.isActive || isUnavailable || !onSelectTable) return;
                      onSelectTable(table.id);
                    }}
                    onMouseEnter={() => setHoveredTableId(table.id)}
                    onMouseLeave={() => setHoveredTableId(null)}>
                    <span className="px-0.5 text-center leading-tight">{table.label}</span>
                    <span className="text-[9px] font-normal opacity-75">{table.capacity} мест</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!readOnly && (
        <p className="text-[11px] text-muted">
          Свободные столики подсвечены; занятые отображаются бледнее. Выберите стол, подходящий по
          числу гостей.
        </p>
      )}
    </div>
  );
}
