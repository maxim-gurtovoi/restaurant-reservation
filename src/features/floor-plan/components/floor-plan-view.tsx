'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FloorPlanElementType, TableShape } from '@prisma/client';
import { getFloorPlanElementPresentation } from '@/features/floor-plan/components/floor-plan-element-icon';
import { cn } from '@/lib/utils';

export type FloorPlanViewFloor = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export type FloorPlanViewTable = {
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
};

export type FloorPlanViewElement = {
  id: string;
  floorPlanId: string;
  type: FloorPlanElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string | null;
};

type FloorPlanViewProps = {
  floorPlans: FloorPlanViewFloor[];
  tables: FloorPlanViewTable[];
  /** Decorative elements (bar counters, stages, plants, etc.). Optional. */
  elements?: FloorPlanViewElement[];
  selectedTableId?: string | null;
  unavailableTableIds?: string[];
  onSelectTable?: (tableId: string) => void;
  /** Read-only overview — no selection, neutral table styling. */
  readOnly?: boolean;
  headerEyebrow?: string;
  /** Optional: initial active floor on first render. Falls back to first floor. */
  initialFloorPlanId?: string;
};

const MIN_CANVAS_HEIGHT = 280;

export function FloorPlanView({
  floorPlans,
  tables,
  elements = [],
  selectedTableId,
  unavailableTableIds = [],
  onSelectTable,
  readOnly = false,
  headerEyebrow = 'Шаг 2 · Выберите столик',
  initialFloorPlanId,
}: FloorPlanViewProps) {
  const [manualFloorId, setManualFloorId] = useState<string | null>(null);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [trackedSelectedId, setTrackedSelectedId] = useState<string | null>(
    selectedTableId ?? null,
  );

  // Follow external selection: when the user picks a table on another floor
  // (e.g. via list), snap to that floor automatically. Implemented via
  // "store a snapshot of a prop" pattern (setState during render) to avoid
  // a useEffect purely for syncing state.
  if ((selectedTableId ?? null) !== trackedSelectedId) {
    setTrackedSelectedId(selectedTableId ?? null);
    if (selectedTableId) {
      const selectedTable = tables.find((t) => t.id === selectedTableId);
      if (selectedTable) {
        setManualFloorId(selectedTable.floorPlanId);
      }
    }
  }

  const activeFloor = useMemo(() => {
    if (!floorPlans.length) return null;
    if (manualFloorId) {
      const match = floorPlans.find((f) => f.id === manualFloorId);
      if (match) return match;
    }
    if (initialFloorPlanId) {
      const match = floorPlans.find((f) => f.id === initialFloorPlanId);
      if (match) return match;
    }
    return floorPlans[0];
  }, [floorPlans, manualFloorId, initialFloorPlanId]);

  if (!floorPlans.length || !tables.length) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-5 text-sm text-muted shadow-card-soft">
        <p>Для этого ресторана ещё не настроен план зала.</p>
      </div>
    );
  }

  if (!activeFloor) {
    return null;
  }

  const planTables = tables.filter((t) => t.floorPlanId === activeFloor.id);
  const planElements = elements.filter((e) => e.floorPlanId === activeFloor.id);

  const selectedTableOnOtherFloor =
    selectedTableId != null &&
    tables.some((t) => t.id === selectedTableId && t.floorPlanId !== activeFloor.id);

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-text/80">
            {headerEyebrow}
          </p>
          <p className="text-sm font-medium text-foreground">
            План зала: <span className="font-semibold">{activeFloor.name}</span>
          </p>
        </div>

        <FloorPlanLegend elements={planElements} />
      </div>

      {floorPlans.length > 1 ? (
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-border/55 bg-surface-soft/60 p-1 text-sm"
          role="tablist"
          aria-label="Зоны ресторана"
        >
          {floorPlans.map((floor) => {
            const active = floor.id === activeFloor.id;
            return (
              <button
                key={floor.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setManualFloorId(floor.id)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:bg-surface hover:text-foreground',
                )}
              >
                {floor.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedTableOnOtherFloor ? (
        <div className="rounded-lg border border-accent-border/60 bg-accent-bg/50 px-3 py-2 text-xs text-accent-text">
          Выбранный стол находится на другой зоне — переключитесь, чтобы увидеть его расположение.
        </div>
      ) : null}

      <FloorPlanCanvas
        floor={activeFloor}
        tables={planTables}
        elements={planElements}
        selectedTableId={selectedTableId ?? null}
        unavailableTableIds={unavailableTableIds}
        readOnly={readOnly}
        hoveredTableId={hoveredTableId}
        onHover={setHoveredTableId}
        onSelectTable={onSelectTable}
      />

      {!readOnly && (
        <p className="text-[11px] text-muted">
          Свободные столы выделены акцентным цветом, занятые отображаются бледнее. Выберите стол,
          подходящий по числу гостей.
        </p>
      )}
    </div>
  );
}

type FloorPlanCanvasProps = {
  floor: FloorPlanViewFloor;
  tables: FloorPlanViewTable[];
  elements: FloorPlanViewElement[];
  selectedTableId: string | null;
  unavailableTableIds: string[];
  readOnly: boolean;
  hoveredTableId: string | null;
  onHover: (id: string | null) => void;
  onSelectTable?: (id: string) => void;
};

function FloorPlanCanvas({
  floor,
  tables,
  elements,
  selectedTableId,
  unavailableTableIds,
  readOnly,
  hoveredTableId,
  onHover,
  onSelectTable,
}: FloorPlanCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      setContainerWidth(el.clientWidth);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scale floor plan to the container width, but clamp so it never overflows
  // and never collapses below readable size.
  const scale = containerWidth > 0 ? containerWidth / floor.width : 1;
  const renderedHeight = Math.max(MIN_CANVAS_HEIGHT, floor.height * scale);

  if (!tables.length && !elements.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-surface-soft p-5 text-sm text-muted">
        На этом плане зала пока нет столиков.
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden rounded-xl border border-border/55 bg-[linear-gradient(180deg,rgba(250,248,245,0.98)_0%,rgba(240,236,228,1)_100%)]"
      style={{ height: renderedHeight }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: floor.width,
          height: floor.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundImage: [
            'linear-gradient(90deg,rgba(120,100,80,0.06) 1px,transparent 1px)',
            'linear-gradient(rgba(120,100,80,0.06) 1px,transparent 1px)',
          ].join(','),
          backgroundSize: '32px 32px',
        }}
      >
        {elements.map((element) => (
          <FloorPlanElementBox key={element.id} element={element} />
        ))}

        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const isUnavailable = unavailableTableIds.includes(table.id);
          const isHovered = hoveredTableId === table.id && !readOnly;

          let innerScale = 1;
          if (!readOnly && table.isActive && !isUnavailable) {
            if (isSelected) innerScale = 1.06;
            else if (isHovered) innerScale = 1.035;
          }

          const rotateTransform = `rotate(${table.rotation}deg) scale(${innerScale})`;

          const shapeOutline =
            table.shape === 'ROUND'
              ? 'rounded-full'
              : table.shape === 'SQUARE'
                ? 'rounded-lg'
                : 'rounded-xl';

          const shapeBorder =
            table.shape === 'ROUND'
              ? 'border-[2.5px]'
              : table.shape === 'SQUARE'
                ? 'border-2'
                : 'border-2';

          let stateClasses = '';
          if (readOnly) {
            if (!table.isActive) {
              stateClasses =
                'border-dashed border-border/60 bg-surface-soft text-muted opacity-60 cursor-default';
            } else {
              stateClasses =
                'border-[#c9ad7a] bg-[#fff6e6] text-[#5a3f1a] cursor-default shadow-sm';
            }
          } else if (!table.isActive) {
            stateClasses =
              'border-border/60 bg-surface-soft text-muted opacity-55 cursor-not-allowed';
          } else if (isUnavailable) {
            stateClasses =
              'border-border/55 bg-surface-soft text-muted opacity-60 cursor-not-allowed';
          } else if (isSelected) {
            stateClasses = cn(
              'z-10 cursor-pointer border-accent-text bg-accent-bg text-accent-text',
              'shadow-[0_0_0_3px_rgba(123,47,155,0.35),0_8px_22px_rgba(28,28,28,0.12)]',
              'font-semibold ring-2 ring-accent-text/90',
            );
          } else {
            stateClasses = cn(
              'cursor-pointer border-[#d9b47a] bg-[#fff2d6] text-[#5a3f1a]',
              'shadow-card-soft hover:border-accent-border hover:bg-accent-bg/70 hover:text-accent-text',
            );
          }

          const baseClasses =
            'absolute flex flex-col items-center justify-center text-[11px] font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out';

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
              }}
            >
              <button
                type="button"
                disabled={readOnly || !table.isActive || isUnavailable || !onSelectTable}
                className={cn(
                  baseClasses,
                  shapeOutline,
                  shapeBorder,
                  stateClasses,
                  'h-full w-full select-none',
                )}
                style={{ transform: rotateTransform, transformOrigin: 'center' }}
                onClick={() => {
                  if (readOnly || !table.isActive || isUnavailable || !onSelectTable) return;
                  onSelectTable(table.id);
                }}
                onMouseEnter={() => onHover(table.id)}
                onMouseLeave={() => onHover(null)}
              >
                <span className="px-0.5 text-center leading-tight">{table.label}</span>
                <span className="text-[10px] font-normal opacity-80">{table.capacity} мест</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloorPlanElementBox({ element }: { element: FloorPlanViewElement }) {
  const presentation = getFloorPlanElementPresentation(element.type);
  const Icon = presentation.icon;
  const rotate = `rotate(${element.rotation}deg)`;
  const a11yName = element.label?.trim() || presentation.label;

  const isThin = element.type === 'TERRACE_RAILING' || element.type === 'WALL';

  // Size from the shorter plan side so flat strips (e.g. windows along a wall)
  // don't inherit a tall min-height that clips the icon.
  const shortSide = Math.min(element.width, element.height);
  const fitRatio = element.type === 'WINDOW' ? 0.58 : 0.68;
  const iconSize = Math.round(
    Math.min(36, Math.max(10, shortSide * fitRatio)),
  );

  return (
    <div
      role="img"
      aria-label={a11yName}
      className={cn(
        'pointer-events-none absolute flex items-center justify-center overflow-hidden border',
        presentation.surface,
        presentation.border,
        presentation.text,
        isThin ? 'rounded-sm' : 'rounded-lg',
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: rotate,
        transformOrigin: 'center',
      }}
    >
      {!isThin ? (
        <Icon
          className="shrink-0"
          width={iconSize}
          height={iconSize}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function FloorPlanLegend({ elements }: { elements: FloorPlanViewElement[] }) {
  const uniqueTypes = useMemo(() => {
    const seen = new Set<FloorPlanElementType>();
    const order: FloorPlanElementType[] = [];
    for (const el of elements) {
      if (!seen.has(el.type)) {
        seen.add(el.type);
        order.push(el.type);
      }
    }
    order.sort((a, b) => {
      const la = getFloorPlanElementPresentation(a).label;
      const lb = getFloorPlanElementPresentation(b).label;
      return la.localeCompare(lb, 'ru', { sensitivity: 'base' });
    });
    return order;
  }, [elements]);

  if (!uniqueTypes.length) {
    return null;
  }

  return (
    <div className="max-w-full text-right" aria-label="Обозначения на плане">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
        Обозначения
      </p>
      <ul className="flex flex-row flex-wrap items-center justify-end gap-x-3 gap-y-2">
        {uniqueTypes.map((type) => {
          const p = getFloorPlanElementPresentation(type);
          const Icon = p.icon;
          return (
            <li key={type} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                  p.surface,
                  p.border,
                  p.text,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="max-w-36 text-left text-[11px] font-medium leading-snug text-foreground/90">
                {p.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
