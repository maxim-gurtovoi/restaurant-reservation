/**
 * Лёгкий демо-«векторный» скор для подсказок: n-gram хеши в фиксированное пространство,
 * L2-нормализация и косинус + эвристики (подстрока, рейтинг, отзывы).
 * Не ML-модель: детерминированно и без внешних API.
 */
export const EMBEDDING_DIM = 32;

function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Разрежённый профиль текста (норма ≈ 1). */
export function textFeatureVector(text: string): number[] {
  const t = text.toLowerCase().trim().replace(/\s+/g, ' ');
  const v = new Array(EMBEDDING_DIM).fill(0);
  if (!t) return v;

  for (let i = 0; i <= t.length - 3; i++) {
    const slice = t.slice(i, i + 3);
    const idx = fnv1a32(slice) % EMBEDDING_DIM;
    v[idx] += 1;
  }
  if (t.length === 1) {
    const idx = fnv1a32(t) % EMBEDDING_DIM;
    v[idx] += 1;
  } else if (t.length === 2) {
    const idx = fnv1a32(t) % EMBEDDING_DIM;
    v[idx] += 1;
  }

  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}

export function restaurantEmbeddingText(input: {
  name: string;
  cuisine: string | null;
  features: readonly string[];
}): string {
  return `${input.name} ${input.cuisine ?? ''} ${input.features.join(' ')}`.toLowerCase();
}

/**
 * Скор релевантности запроса к ресторану (чем выше — тем лучше).
 * Косинус между профилями текста + бонусы за совпадение и качество карточки.
 */
export function recommendationScore(
  query: string,
  restaurantText: string,
  rating: number | null,
  reviewsCount: number,
): number {
  const q = query.toLowerCase().trim();
  const rt = restaurantText.toLowerCase();
  if (!q) return 0;

  const vq = textFeatureVector(q);
  const vr = textFeatureVector(restaurantText);
  let score = cosineSimilarity(vq, vr);

  if (rt.includes(q)) score += 0.42;
  else {
    const words = q.split(/\s+/).filter((w) => w.length > 1);
    const hit = words.some((w) => rt.includes(w));
    if (hit) score += 0.22;
  }

  score += ((rating ?? 0) / 5) * 0.1;
  score += Math.min(1, Math.log1p(reviewsCount) / 10) * 0.06;
  return score;
}
