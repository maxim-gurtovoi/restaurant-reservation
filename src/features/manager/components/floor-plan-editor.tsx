'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { FloorPlanElementType, TableShape } from '@prisma/client';
import {
  getFloorPlanElementPresentation,
} from '@/features/floor-plan/components/floor-plan-element-icon';
import type {
  EditableElement,
  EditableTable,
  SaveFloorPlanResult,
} from '@/features/manager/server/floor-plan-editor.service';
import { cn } from '@/lib/utils';

const SNAP = 16;
const MIN_SIZE = 32;
const MIN_ELEMENT_SIZE = 16;

type EditorTable = EditableTable & { _clientId: string };
type EditorElement = EditableElement & { _clientId: string };

type EditorItem =
  | { kind: 'table'; id: string }
  | { kind: 'element'; id: string };

type EditorState = {
  width: number;
  height: number;
  tables: EditorTable[];
  elements: EditorElement[];
  selection: EditorItem | null;
  dirty: boolean;
  history: Array<Pick<EditorState, 'tables' | 'elements' | 'width' | 'height'>>;
  future: Array<Pick<EditorState, 'tables' | 'elements' | 'width' | 'height'>>;
};

type EditorAction =
  | { type: 'select'; item: EditorItem | null }
  | { type: 'add-table'; shape: TableShape }
  | { type: 'add-element'; elementType: FloorPlanElementType }
  | { type: 'delete' }
  | {
      type: 'patch-table';
      id: string;
      patch: Partial<Omit<EditableTable, 'id'>>;
    }
  | {
      type: 'patch-element';
      id: string;
      patch: Partial<Omit<EditableElement, 'id'>>;
    }
  | { type: 'set-canvas-size'; width: number; height: number }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'mark-clean' };

function snap(value: number): number {
  return Math.round(value / SNAP) * SNAP;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function historyPush(
  state: EditorState,
): Pick<EditorState, 'tables' | 'elements' | 'width' | 'height'>[] {
  const snapshot = {
    tables: state.tables.map((t) => ({ ...t })),
    elements: state.elements.map((e) => ({ ...e })),
    width: state.width,
    height: state.height,
  };
  const next = [...state.history, snapshot];
  return next.length > 40 ? next.slice(next.length - 40) : next;
}

function generateClientId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nextTableLabel(tables: EditorTable[]): string {
  const usedNumbers = tables
    .map((t) => /^T(\d+)$/i.exec(t.label)?.[1])
    .filter((s): s is string => !!s)
    .map((s) => Number(s));
  let n = tables.length + 1;
  while (usedNumbers.includes(n)) n += 1;
  return `T${n}`;
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'select':
      return { ...state, selection: action.item };

    case 'add-table': {
      const clientId = generateClientId('t');
      const cx = snap(state.width / 2 - 40);
      const cy = snap(state.height / 2 - 40);
      const defaults = {
        ROUND: { width: 80, height: 80 },
        SQUARE: { width: 80, height: 80 },
        RECTANGLE: { width: 160, height: 80 },
      } as const;
      const dims = defaults[action.shape];
      const newTable: EditorTable = {
        _clientId: clientId,
        id: clientId,
        label: nextTableLabel(state.tables),
        capacity: action.shape === 'RECTANGLE' ? 6 : 4,
        shape: action.shape,
        x: cx,
        y: cy,
        width: dims.width,
        height: dims.height,
        rotation: 0,
        isActive: true,
      };
      return {
        ...state,
        history: historyPush(state),
        future: [],
        tables: [...state.tables, newTable],
        selection: { kind: 'table', id: clientId },
        dirty: true,
      };
    }

    case 'add-element': {
      const clientId = generateClientId('e');
      const newElement: EditorElement = {
        _clientId: clientId,
        id: clientId,
        type: action.elementType,
        x: snap(state.width / 2 - 60),
        y: snap(state.height / 2 - 40),
        width: 120,
        height: 80,
        rotation: 0,
        label: null,
      };
      return {
        ...state,
        history: historyPush(state),
        future: [],
        elements: [...state.elements, newElement],
        selection: { kind: 'element', id: clientId },
        dirty: true,
      };
    }

    case 'delete': {
      if (!state.selection) return state;
      const h = historyPush(state);
      if (state.selection.kind === 'table') {
        return {
          ...state,
          history: h,
          future: [],
          tables: state.tables.filter((t) => t._clientId !== state.selection!.id),
          selection: null,
          dirty: true,
        };
      }
      return {
        ...state,
        history: h,
        future: [],
        elements: state.elements.filter((e) => e._clientId !== state.selection!.id),
        selection: null,
        dirty: true,
      };
    }

    case 'patch-table':
      return {
        ...state,
        history: historyPush(state),
        future: [],
        tables: state.tables.map((t) =>
          t._clientId === action.id ? { ...t, ...action.patch } : t,
        ),
        dirty: true,
      };

    case 'patch-element':
      return {
        ...state,
        history: historyPush(state),
        future: [],
        elements: state.elements.map((e) =>
          e._clientId === action.id ? { ...e, ...action.patch } : e,
        ),
        dirty: true,
      };

    case 'set-canvas-size':
      return {
        ...state,
        history: historyPush(state),
        future: [],
        width: action.width,
        height: action.height,
        dirty: true,
      };

    case 'undo': {
      if (!state.history.length) return state;
      const snapshot = state.history[state.history.length - 1];
      return {
        ...state,
        history: state.history.slice(0, -1),
        future: [
          {
            tables: state.tables,
            elements: state.elements,
            width: state.width,
            height: state.height,
          },
          ...state.future,
        ],
        tables: snapshot.tables.map((t) => ({ ...t })) as EditorTable[],
        elements: snapshot.elements.map((e) => ({ ...e })) as EditorElement[],
        width: snapshot.width,
        height: snapshot.height,
        dirty: true,
      };
    }

    case 'redo': {
      if (!state.future.length) return state;
      const [snapshot, ...rest] = state.future;
      return {
        ...state,
        history: [
          ...state.history,
          {
            tables: state.tables,
            elements: state.elements,
            width: state.width,
            height: state.height,
          },
        ],
        future: rest,
        tables: snapshot.tables.map((t) => ({ ...t })) as EditorTable[],
        elements: snapshot.elements.map((e) => ({ ...e })) as EditorElement[],
        width: snapshot.width,
        height: snapshot.height,
        dirty: true,
      };
    }

    case 'mark-clean':
      return { ...state, dirty: false };

    default:
      return state;
  }
}

function initState(
  floorPlan: { id: string; width: number; height: number },
  initialTables: EditableTable[],
  initialElements: EditableElement[],
): EditorState {
  return {
    width: floorPlan.width,
    height: floorPlan.height,
    tables: initialTables.map((t) => ({ ...t, _clientId: t.id })),
    elements: initialElements.map((e) => ({ ...e, _clientId: e.id })),
    selection: null,
    dirty: false,
    history: [],
    future: [],
  };
}

type FloorPlanEditorProps = {
  floorPlan: { id: string; name: string; width: number; height: number };
  initialTables: EditableTable[];
  initialElements: EditableElement[];
  onSaveAction: (payload: unknown) => Promise<SaveFloorPlanResult>;
  onBackAction: () => Promise<void>;
};

const ALL_ELEMENT_TYPES: FloorPlanElementType[] = [
  'BAR_COUNTER',
  'STAGE',
  'STAIRS',
  'FIREPLACE',
  'WINDOW',
  'DOOR',
  'WALL',
  'PLANT',
  'PILLAR',
  'RESTROOM',
  'KITCHEN',
  'HOST_STAND',
  'TERRACE_RAILING',
  'SMOKER',
];

const SHAPE_LABELS: Record<TableShape, string> = {
  ROUND: 'Круглый',
  SQUARE: 'Квадратный',
  RECTANGLE: 'Прямоугольный',
};

export function FloorPlanEditor({
  floorPlan,
  initialTables,
  initialElements,
  onSaveAction,
  onBackAction,
}: FloorPlanEditorProps) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initState(floorPlan, initialTables, initialElements),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [flash, setFlash] = useState<
    { kind: 'ok'; message: string } | { kind: 'err'; message: string } | null
  >(null);

  // Keyboard shortcuts: Delete, Ctrl+Z, Ctrl+Y.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection) {
          e.preventDefault();
          dispatch({ type: 'delete' });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'undo' });
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        dispatch({ type: 'redo' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.selection]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setFlash(null);
    const payload = {
      floorPlanId: floorPlan.id,
      width: state.width,
      height: state.height,
      tables: state.tables.map((t) => {
        // Persisted ids are UUIDs (from DB). Client-generated ids have a "t-" prefix.
        const persisted = !t._clientId.startsWith('t-');
        return {
          id: persisted ? t.id : undefined,
          label: t.label,
          capacity: t.capacity,
          shape: t.shape,
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          rotation: t.rotation,
          isActive: t.isActive,
        };
      }),
      elements: state.elements.map((e) => ({
        type: e.type,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        rotation: e.rotation,
        label: e.label,
      })),
    };

    const result = await onSaveAction(payload);
    setIsSaving(false);
    if (result.ok) {
      dispatch({ type: 'mark-clean' });
      setFlash({ kind: 'ok', message: 'План сохранён' });
    } else {
      setFlash({ kind: 'err', message: result.error });
    }
  }, [floorPlan.id, onSaveAction, state.elements, state.height, state.tables, state.width]);

  const selectedTable = useMemo(
    () =>
      state.selection?.kind === 'table'
        ? state.tables.find((t) => t._clientId === state.selection!.id) ?? null
        : null,
    [state.selection, state.tables],
  );
  const selectedElement = useMemo(
    () =>
      state.selection?.kind === 'element'
        ? state.elements.find((e) => e._clientId === state.selection!.id) ?? null
        : null,
    [state.selection, state.elements],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr_280px]">
      <Toolbar
        onAddTable={(shape) => dispatch({ type: 'add-table', shape })}
        onAddElement={(type) => dispatch({ type: 'add-element', elementType: type })}
        onUndo={() => dispatch({ type: 'undo' })}
        onRedo={() => dispatch({ type: 'redo' })}
        canUndo={state.history.length > 0}
        canRedo={state.future.length > 0}
        onSave={handleSave}
        onBack={onBackAction}
        isSaving={isSaving}
        dirty={state.dirty}
      />

      <div className="space-y-3">
        {flash ? (
          <div
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              flash.kind === 'ok'
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-error/40 bg-error/5 text-error',
            )}
          >
            {flash.message}
          </div>
        ) : null}

        <EditorCanvas
          width={state.width}
          height={state.height}
          tables={state.tables}
          elements={state.elements}
          selection={state.selection}
          dispatch={dispatch}
        />
      </div>

      <PropertiesPanel
        selectedTable={selectedTable}
        selectedElement={selectedElement}
        canvasWidth={state.width}
        canvasHeight={state.height}
        onPatchTable={(id, patch) => dispatch({ type: 'patch-table', id, patch })}
        onPatchElement={(id, patch) =>
          dispatch({ type: 'patch-element', id, patch })
        }
        onChangeCanvasSize={(w, h) =>
          dispatch({ type: 'set-canvas-size', width: w, height: h })
        }
      />
    </div>
  );
}

// -------------------- Toolbar --------------------

function Toolbar({
  onAddTable,
  onAddElement,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onBack,
  isSaving,
  dirty,
}: {
  onAddTable: (shape: TableShape) => void;
  onAddElement: (type: FloorPlanElementType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onBack: () => Promise<void>;
  isSaving: boolean;
  dirty: boolean;
}) {
  return (
    <aside className="space-y-4 rounded-2xl border border-border/55 bg-surface p-4 shadow-card-soft">
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Добавить стол
        </h3>
        <div className="grid gap-1.5">
          {(['ROUND', 'SQUARE', 'RECTANGLE'] as const).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => onAddTable(shape)}
              className="cursor-pointer rounded-lg border border-border bg-surface-soft px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent-border hover:bg-accent-bg/50"
            >
              + {SHAPE_LABELS[shape]}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Добавить элемент
        </h3>
        <select
          className="w-full cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          defaultValue=""
          onChange={(e) => {
            const value = e.currentTarget.value as FloorPlanElementType | '';
            if (!value) return;
            onAddElement(value);
            e.currentTarget.value = '';
          }}
        >
          <option value="">Выбрать тип...</option>
          {ALL_ELEMENT_TYPES.map((t) => {
            const p = getFloorPlanElementPresentation(t);
            return (
              <option key={t} value={t}>
                {p.label || t}
              </option>
            );
          })}
        </select>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          История
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="cursor-pointer rounded-lg border border-border px-2 py-1.5 text-xs font-medium hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Отменить
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="cursor-pointer rounded-lg border border-border px-2 py-1.5 text-xs font-medium hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Вернуть →
          </button>
        </div>
        <p className="text-[11px] text-muted">
          Горячие клавиши: Ctrl+Z, Ctrl+Y, Delete.
        </p>
      </section>

      <section className="space-y-2 border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !dirty}
          className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Сохранение...' : dirty ? 'Сохранить' : 'Нет изменений'}
        </button>
        <form action={onBack}>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-soft"
          >
            Выйти к обзору
          </button>
        </form>
      </section>
    </aside>
  );
}

// -------------------- Canvas --------------------

type DragMode =
  | { type: 'move'; startX: number; startY: number; origX: number; origY: number }
  | {
      type: 'resize';
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    };

function EditorCanvas({
  width,
  height,
  tables,
  elements,
  selection,
  dispatch,
}: {
  width: number;
  height: number;
  tables: EditorTable[];
  elements: EditorElement[];
  selection: EditorItem | null;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = containerWidth > 0 ? containerWidth / width : 1;
  const renderedHeight = Math.max(320, height * scale);

  // Convert client delta → canvas (logical) delta using the current scale.
  const toCanvas = useCallback(
    (dx: number, dy: number) => ({ x: dx / scale, y: dy / scale }),
    [scale],
  );

  const dragRef = useRef<{
    item: EditorItem;
    mode: DragMode;
  } | null>(null);

  const onPointerDown = (
    event: React.PointerEvent,
    item: EditorItem,
    mode: 'move' | 'resize',
  ) => {
    event.stopPropagation();
    event.preventDefault();

    dispatch({ type: 'select', item });

    const currentList =
      item.kind === 'table' ? tables : (elements as unknown as EditorTable[]);
    const current = currentList.find((x) => x._clientId === item.id);
    if (!current) return;

    if (mode === 'move') {
      dragRef.current = {
        item,
        mode: {
          type: 'move',
          startX: event.clientX,
          startY: event.clientY,
          origX: current.x,
          origY: current.y,
        },
      };
    } else {
      dragRef.current = {
        item,
        mode: {
          type: 'resize',
          startX: event.clientX,
          startY: event.clientY,
          origX: current.x,
          origY: current.y,
          origW: current.width,
          origH: current.height,
        },
      };
    }

    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const { item, mode } = drag;
    const { x: dx, y: dy } = toCanvas(
      event.clientX - mode.startX,
      event.clientY - mode.startY,
    );

    if (mode.type === 'move') {
      const itemList = item.kind === 'table' ? tables : elements;
      const current = itemList.find((x) => x._clientId === item.id);
      if (!current) return;
      const nextX = clamp(snap(mode.origX + dx), 0, width - current.width);
      const nextY = clamp(snap(mode.origY + dy), 0, height - current.height);
      if (item.kind === 'table') {
        dispatch({ type: 'patch-table', id: item.id, patch: { x: nextX, y: nextY } });
      } else {
        dispatch({ type: 'patch-element', id: item.id, patch: { x: nextX, y: nextY } });
      }
    } else {
      const minSize = item.kind === 'table' ? MIN_SIZE : MIN_ELEMENT_SIZE;
      const nextW = clamp(snap(mode.origW + dx), minSize, width - mode.origX);
      const nextH = clamp(snap(mode.origH + dy), minSize, height - mode.origY);
      if (item.kind === 'table') {
        dispatch({ type: 'patch-table', id: item.id, patch: { width: nextW, height: nextH } });
      } else {
        dispatch({ type: 'patch-element', id: item.id, patch: { width: nextW, height: nextH } });
      }
    }
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (dragRef.current) {
      (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
      dragRef.current = null;
    }
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: 'select', item: null });
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden rounded-2xl border border-border/55 bg-[linear-gradient(180deg,rgba(250,248,245,0.98)_0%,rgba(240,236,228,1)_100%)] shadow-card"
      style={{ height: renderedHeight }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundImage: [
            'linear-gradient(90deg,rgba(120,100,80,0.08) 1px,transparent 1px)',
            'linear-gradient(rgba(120,100,80,0.08) 1px,transparent 1px)',
          ].join(','),
          backgroundSize: `${SNAP}px ${SNAP}px`,
        }}
        onClick={onCanvasClick}
      >
        {elements.map((element) => {
          const isSelected =
            selection?.kind === 'element' && selection.id === element._clientId;
          return (
            <EditorElementBox
              key={element._clientId}
              element={element}
              selected={isSelected}
              onPointerDown={(e, mode) =>
                onPointerDown(
                  e,
                  { kind: 'element', id: element._clientId },
                  mode,
                )
              }
            />
          );
        })}

        {tables.map((table) => {
          const isSelected =
            selection?.kind === 'table' && selection.id === table._clientId;
          return (
            <EditorTableBox
              key={table._clientId}
              table={table}
              selected={isSelected}
              onPointerDown={(e, mode) =>
                onPointerDown(e, { kind: 'table', id: table._clientId }, mode)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// -------------------- Canvas items --------------------

function EditorTableBox({
  table,
  selected,
  onPointerDown,
}: {
  table: EditorTable;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, mode: 'move' | 'resize') => void;
}) {
  const shapeClass =
    table.shape === 'ROUND'
      ? 'rounded-full'
      : table.shape === 'SQUARE'
        ? 'rounded-lg'
        : 'rounded-xl';

  return (
    <div
      className={cn(
        'absolute cursor-move select-none border-2 bg-[#fff2d6] text-[#5a3f1a] shadow-card-soft',
        shapeClass,
        selected
          ? 'border-accent-text ring-2 ring-accent-text/60'
          : 'border-[#d9b47a]',
        !table.isActive && 'opacity-60',
      )}
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
        transform: `rotate(${table.rotation}deg)`,
        transformOrigin: 'center',
      }}
      onPointerDown={(e) => onPointerDown(e, 'move')}
    >
      <div className="flex h-full w-full flex-col items-center justify-center text-[11px] font-medium leading-tight">
        <span>{table.label}</span>
        <span className="text-[10px] opacity-80">{table.capacity} мест</span>
      </div>
      {selected ? (
        <span
          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-accent-text bg-accent-bg"
          onPointerDown={(e) => onPointerDown(e, 'resize')}
          aria-label="Изменить размер"
        />
      ) : null}
    </div>
  );
}

function EditorElementBox({
  element,
  selected,
  onPointerDown,
}: {
  element: EditorElement;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, mode: 'move' | 'resize') => void;
}) {
  const p = getFloorPlanElementPresentation(element.type);
  const Icon = p.icon;
  const label = element.label ?? p.label;

  return (
    <div
      className={cn(
        'absolute flex cursor-move select-none items-center justify-center gap-1.5 overflow-hidden border',
        p.surface,
        p.border,
        p.text,
        'rounded-lg text-[10px] font-semibold uppercase tracking-widest',
        selected && 'ring-2 ring-accent-text/70',
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'center',
      }}
      onPointerDown={(e) => onPointerDown(e, 'move')}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label ? (
        <span className="truncate px-1 text-[10px] leading-tight">{label}</span>
      ) : null}
      {selected ? (
        <span
          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-accent-text bg-accent-bg"
          onPointerDown={(e) => onPointerDown(e, 'resize')}
          aria-label="Изменить размер"
        />
      ) : null}
    </div>
  );
}

// -------------------- Properties panel --------------------

function PropertiesPanel({
  selectedTable,
  selectedElement,
  canvasWidth,
  canvasHeight,
  onPatchTable,
  onPatchElement,
  onChangeCanvasSize,
}: {
  selectedTable: EditorTable | null;
  selectedElement: EditorElement | null;
  canvasWidth: number;
  canvasHeight: number;
  onPatchTable: (id: string, patch: Partial<Omit<EditableTable, 'id'>>) => void;
  onPatchElement: (
    id: string,
    patch: Partial<Omit<EditableElement, 'id'>>,
  ) => void;
  onChangeCanvasSize: (width: number, height: number) => void;
}) {
  return (
    <aside className="space-y-4 rounded-2xl border border-border/55 bg-surface p-4 shadow-card-soft">
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Размер холста
        </h3>
        <div className="flex items-center gap-2">
          <NumberInput
            value={canvasWidth}
            min={400}
            max={3000}
            step={SNAP}
            onChange={(v) => onChangeCanvasSize(v, canvasHeight)}
            label="Ш"
          />
          <span className="text-muted">×</span>
          <NumberInput
            value={canvasHeight}
            min={300}
            max={3000}
            step={SNAP}
            onChange={(v) => onChangeCanvasSize(canvasWidth, v)}
            label="В"
          />
        </div>
      </section>

      <div className="border-t border-border/60 pt-4">
        {selectedTable ? (
          <TableProperties
            table={selectedTable}
            onPatch={(patch) => onPatchTable(selectedTable._clientId, patch)}
          />
        ) : selectedElement ? (
          <ElementProperties
            element={selectedElement}
            onPatch={(patch) => onPatchElement(selectedElement._clientId, patch)}
          />
        ) : (
          <p className="text-sm text-muted">
            Кликните на стол или элемент, чтобы отредактировать его параметры.
          </p>
        )}
      </div>
    </aside>
  );
}

function TableProperties({
  table,
  onPatch,
}: {
  table: EditorTable;
  onPatch: (patch: Partial<Omit<EditableTable, 'id'>>) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Стол
      </h3>

      <label className="flex flex-col gap-1 text-xs">
        Название
        <input
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          value={table.label}
          onChange={(e) => onPatch({ label: e.target.value.slice(0, 12) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Мест
        <input
          type="number"
          min={1}
          max={30}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          value={table.capacity}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onPatch({ capacity: clamp(Math.round(v), 1, 30) });
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Форма
        <select
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          value={table.shape}
          onChange={(e) => onPatch({ shape: e.target.value as TableShape })}
        >
          {(['ROUND', 'SQUARE', 'RECTANGLE'] as const).map((s) => (
            <option key={s} value={s}>
              {SHAPE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          value={table.x}
          min={0}
          max={3000}
          step={SNAP}
          onChange={(v) => onPatch({ x: v })}
        />
        <NumberInput
          label="Y"
          value={table.y}
          min={0}
          max={3000}
          step={SNAP}
          onChange={(v) => onPatch({ y: v })}
        />
        <NumberInput
          label="Ш"
          value={table.width}
          min={MIN_SIZE}
          max={600}
          step={SNAP}
          onChange={(v) => onPatch({ width: v })}
        />
        <NumberInput
          label="В"
          value={table.height}
          min={MIN_SIZE}
          max={600}
          step={SNAP}
          onChange={(v) => onPatch({ height: v })}
        />
      </div>

      <NumberInput
        label="Поворот °"
        value={table.rotation}
        min={-180}
        max={180}
        step={5}
        onChange={(v) => onPatch({ rotation: v })}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={table.isActive}
          onChange={(e) => onPatch({ isActive: e.target.checked })}
        />
        Доступен для бронирования
      </label>
    </div>
  );
}

function ElementProperties({
  element,
  onPatch,
}: {
  element: EditorElement;
  onPatch: (patch: Partial<Omit<EditableElement, 'id'>>) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Элемент
      </h3>

      <label className="flex flex-col gap-1 text-xs">
        Тип
        <select
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          value={element.type}
          onChange={(e) =>
            onPatch({ type: e.target.value as FloorPlanElementType })
          }
        >
          {ALL_ELEMENT_TYPES.map((t) => {
            const p = getFloorPlanElementPresentation(t);
            return (
              <option key={t} value={t}>
                {p.label || t}
              </option>
            );
          })}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs">
        Подпись (опционально)
        <input
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm"
          value={element.label ?? ''}
          maxLength={40}
          onChange={(e) =>
            onPatch({ label: e.target.value.length ? e.target.value : null })
          }
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          value={element.x}
          min={0}
          max={3000}
          step={SNAP}
          onChange={(v) => onPatch({ x: v })}
        />
        <NumberInput
          label="Y"
          value={element.y}
          min={0}
          max={3000}
          step={SNAP}
          onChange={(v) => onPatch({ y: v })}
        />
        <NumberInput
          label="Ш"
          value={element.width}
          min={MIN_ELEMENT_SIZE}
          max={800}
          step={SNAP}
          onChange={(v) => onPatch({ width: v })}
        />
        <NumberInput
          label="В"
          value={element.height}
          min={MIN_ELEMENT_SIZE}
          max={800}
          step={SNAP}
          onChange={(v) => onPatch({ height: v })}
        />
      </div>

      <NumberInput
        label="Поворот °"
        value={element.rotation}
        min={-180}
        max={180}
        step={5}
        onChange={(v) => onPatch({ rotation: v })}
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-muted">
      {label}
      <input
        type="number"
        className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(clamp(Math.round(n), min, max));
        }}
      />
    </label>
  );
}
