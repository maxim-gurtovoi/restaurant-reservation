/** Уровень цен для карточек списка (гривны, как в блоке «Похожие»). */
export function restaurantPriceGlyphs(level: number | null): string | null {
  if (!level) return null;
  const clamped = Math.min(4, Math.max(1, level));
  return '\u20B4'.repeat(clamped);
}
