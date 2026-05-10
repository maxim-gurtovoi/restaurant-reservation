import type { ExtraRestaurantSeedRow } from './extra-restaurants.demo';

/** URL slug from display name (same rules as `prisma/seed.ts` for extra rows). */
export function slugifyExtraRestaurantName(name: string): string {
  const map: Record<string, string> = {
    'ă': 'a',
    'â': 'a',
    'î': 'i',
    'ș': 's',
    'ş': 's',
    'ț': 't',
    'ţ': 't',
    'Ă': 'a',
    'Â': 'a',
    'Î': 'i',
    'Ș': 's',
    'Ş': 's',
    'Ț': 't',
    'Ţ': 't',
    'À': 'a',
    'È': 'e',
    'É': 'e',
    'Ì': 'i',
    'Í': 'i',
    'Ò': 'o',
    'Ó': 'o',
    'Ù': 'u',
    'Ú': 'u',
  };
  let s = [...name].map((ch) => map[ch] ?? ch).join('');
  s = s.normalize('NFD').replace(/\p{M}/gu, '');
  s = s
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return s.length > 0 ? s : 'restaurant';
}

/** Same order and collision rules as `prisma/seed.ts` for bulk demo restaurants. */
export function planExtraRestaurantSlugAssignments(
  rows: readonly ExtraRestaurantSeedRow[],
  alreadyUsedSlugs: Iterable<string>,
): Array<{ slug: string; row: ExtraRestaurantSeedRow }> {
  const used = new Set(alreadyUsedSlugs);
  const out: Array<{ slug: string; row: ExtraRestaurantSeedRow }> = [];
  for (const row of rows) {
    const baseSlug = row.slug ?? slugifyExtraRestaurantName(row.name);
    let slug = baseSlug;
    let n = 2;
    while (used.has(slug)) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }
    used.add(slug);
    out.push({ slug, row });
  }
  return out;
}
