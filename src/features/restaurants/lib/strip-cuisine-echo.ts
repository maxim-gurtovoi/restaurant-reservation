function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function capitalizeFirstLetter(s: string): string {
  const chars = Array.from(s);
  if (!chars.length) return s;
  chars[0] = chars[0].toUpperCase();
  return chars.join('');
}

/** Первый сегмент подписи кухни до разделителей «·», • или запятой. */
function cuisineLabelVariants(cuisine: string): string[] {
  const raw = cuisine
    .split(/\s*[·•,]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const sorted = [...new Set(raw)].sort((a, b) => b.length - a.length);
  return sorted.length ? sorted : [cuisine.trim()];
}

/**
 * Убирает повтор между строкой «кухня» и телом описания, например:
 * «Румынская» + «Румынская кухня с акцентом…» → «С акцентом…»
 * «Итальянская» + «Итальянская классика: …» → «Классика: …»
 */
export function stripLeadingCuisineEcho(description: string, cuisine: string | null): string {
  const trimmed = description.trim();
  if (!cuisine?.trim()) return trimmed;

  const descriptorTail =
    '(?:\\s+(?:кухня|cuisine|cuisines|kitchen|bucătărie|bucătăria|bucatarie|bucătăriei|классика|classics?|clasic[aă]?))?';

  for (const label of cuisineLabelVariants(cuisine.trim())) {
    const escaped = escapeRegExp(label);
    const re = new RegExp(`^${escaped}${descriptorTail}\\s*[,:\\-\\u2014\\u00b7]?\\s*`, 'iu');
    const next = trimmed.replace(re, '').trim();
    if (next.length > 0 && next !== trimmed) {
      return capitalizeFirstLetter(next);
    }
  }

  return trimmed;
}
