/** Optional floor regions for demo layouts — coordinates match seeded floor plan sizes. */

export type FloorVisualZone = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Preset = { floorWidth: number; floorHeight: number; zones: FloorVisualZone[] };

const PRESETS: Record<string, Preset> = {
  gastrobar: {
    floorWidth: 900,
    floorHeight: 620,
    zones: [
      { label: 'Основной зал', x: 36, y: 36, width: 548, height: 292 },
      { label: 'Барная зона', x: 608, y: 36, width: 256, height: 292 },
      { label: 'Банкетная зона', x: 36, y: 348, width: 828, height: 236 },
    ],
  },
  'pegas-terrace-restaurant': {
    floorWidth: 820,
    floorHeight: 560,
    zones: [
      { label: 'Терраса', x: 32, y: 32, width: 756, height: 228 },
      { label: 'Обеденный зал', x: 32, y: 284, width: 756, height: 244 },
    ],
  },
  smokehouse: {
    floorWidth: 880,
    floorHeight: 640,
    zones: [
      { label: 'Зал', x: 40, y: 40, width: 800, height: 268 },
      { label: 'Зона больших столов', x: 40, y: 332, width: 800, height: 268 },
    ],
  },
  'attico-terrace-restaurant': {
    floorWidth: 860,
    floorHeight: 600,
    zones: [
      { label: 'Панорама', x: 36, y: 36, width: 788, height: 252 },
      { label: 'Тихая зона', x: 36, y: 308, width: 788, height: 256 },
    ],
  },
  'garden-restaurant-terrace': {
    floorWidth: 780,
    floorHeight: 560,
    zones: [
      { label: 'Садовая зона', x: 32, y: 32, width: 716, height: 240 },
      { label: 'Семейные столы', x: 32, y: 292, width: 716, height: 236 },
    ],
  },
  'la-placinte-stefan-cel-mare': {
    floorWidth: 840,
    floorHeight: 580,
    zones: [
      { label: 'Главный зал', x: 36, y: 36, width: 768, height: 268 },
      { label: 'Компания', x: 36, y: 324, width: 768, height: 220 },
    ],
  },
};

export function getVisualZonesForFloor(
  restaurantSlug: string,
  floorWidth: number,
  floorHeight: number,
): FloorVisualZone[] {
  const preset = PRESETS[restaurantSlug];
  if (!preset || preset.floorWidth !== floorWidth || preset.floorHeight !== floorHeight) {
    return [];
  }
  return preset.zones;
}
