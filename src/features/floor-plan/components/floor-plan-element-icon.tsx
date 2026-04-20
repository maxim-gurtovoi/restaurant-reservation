import type { FloorPlanElementType } from '@prisma/client';
import {
  ArmchairIcon,
  BathIcon,
  ChefHatIcon,
  CircleIcon,
  ConciergeBellIcon,
  DoorClosedIcon,
  FenceIcon,
  FlameIcon,
  LeafIcon,
  Music2Icon,
  StepForwardIcon,
  type LucideIcon,
  SquareIcon,
  WineIcon,
  XIcon,
} from 'lucide-react';

/**
 * Visual config for a floor plan decorative element — icon + base colors + default label.
 * Colors are intentionally muted so tables remain the primary focus.
 */
type ElementPresentation = {
  icon: LucideIcon;
  label: string;
  /** Background/border tokens applied to the element "body". */
  surface: string;
  border: string;
  text: string;
};

const PRESENTATIONS: Record<FloorPlanElementType, ElementPresentation> = {
  BAR_COUNTER: {
    icon: WineIcon,
    label: 'Бар',
    surface: 'bg-[color-mix(in_oklab,var(--color-accent-bg)_55%,var(--color-surface-soft))]',
    border: 'border-accent-border/70',
    text: 'text-accent-text',
  },
  STAGE: {
    icon: Music2Icon,
    label: 'Сцена',
    surface: 'bg-[color-mix(in_oklab,var(--color-accent-bg)_35%,var(--color-surface-soft))]',
    border: 'border-accent-border/60',
    text: 'text-accent-text',
  },
  STAIRS: {
    icon: StepForwardIcon,
    label: 'Лестница',
    surface: 'bg-surface-soft',
    border: 'border-border/80',
    text: 'text-foreground/65',
  },
  FIREPLACE: {
    icon: FlameIcon,
    label: 'Камин',
    surface: 'bg-[color-mix(in_oklab,#f7caa8_35%,var(--color-surface-soft))]',
    border: 'border-[#c77a3f]/60',
    text: 'text-[#a05518]',
  },
  WINDOW: {
    icon: SquareIcon,
    label: 'Окно',
    surface: 'bg-[color-mix(in_oklab,#cfe3f0_40%,var(--color-surface-soft))]',
    border: 'border-[#6fa0c0]/55',
    text: 'text-[#3d6a86]',
  },
  DOOR: {
    icon: DoorClosedIcon,
    label: 'Дверь',
    surface: 'bg-surface-soft',
    border: 'border-border',
    text: 'text-foreground/70',
  },
  WALL: {
    icon: XIcon,
    label: '',
    surface: 'bg-foreground/15',
    border: 'border-foreground/20',
    text: 'text-foreground/50',
  },
  PLANT: {
    icon: LeafIcon,
    label: 'Зелень',
    surface: 'bg-[color-mix(in_oklab,#c8e0c4_45%,var(--color-surface-soft))]',
    border: 'border-[#6a9a6a]/55',
    text: 'text-[#3a6d3a]',
  },
  PILLAR: {
    icon: CircleIcon,
    label: 'Колонна',
    surface: 'bg-foreground/10',
    border: 'border-foreground/20',
    text: 'text-foreground/55',
  },
  RESTROOM: {
    icon: BathIcon,
    label: 'WC',
    surface: 'bg-surface-soft',
    border: 'border-border',
    text: 'text-foreground/70',
  },
  KITCHEN: {
    icon: ChefHatIcon,
    label: 'Кухня',
    surface: 'bg-[color-mix(in_oklab,#f0e6cc_40%,var(--color-surface-soft))]',
    border: 'border-[#b79a5d]/55',
    text: 'text-[#7d6020]',
  },
  HOST_STAND: {
    icon: ConciergeBellIcon,
    label: 'Хостес',
    surface: 'bg-[color-mix(in_oklab,var(--color-accent-bg)_40%,var(--color-surface-soft))]',
    border: 'border-accent-border/60',
    text: 'text-accent-text',
  },
  TERRACE_RAILING: {
    icon: FenceIcon,
    label: 'Ограждение',
    surface: 'bg-transparent',
    border: 'border-foreground/35 border-dashed',
    text: 'text-foreground/50',
  },
  SMOKER: {
    icon: ArmchairIcon,
    label: 'Коптильня',
    surface: 'bg-[color-mix(in_oklab,#d6beaa_40%,var(--color-surface-soft))]',
    border: 'border-[#7a5a40]/55',
    text: 'text-[#5a3f24]',
  },
};

export function getFloorPlanElementPresentation(
  type: FloorPlanElementType,
): ElementPresentation {
  return PRESENTATIONS[type];
}
