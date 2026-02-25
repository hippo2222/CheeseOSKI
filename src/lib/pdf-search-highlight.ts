export interface NormalizedMap {
  normalized: string;
  normToRaw: number[];
}

export interface MatchRange {
  startRaw: number;
  endRawExclusive: number;
  mode: 'spaced' | 'compact';
}

export function normalizeForSearchWithMap(input: string, options?: { removeSpaces?: boolean }): NormalizedMap {
  const removeSpaces = options?.removeSpaces ?? false;
  let normalized = '';
  const normToRaw: number[] = [];
  let lastWasSpace = true;

  for (let i = 0; i < input.length; i += 1) {
    const rawChar = input[i];

    if (rawChar === '\u00ad') {
      continue;
    }

    if (/\s/.test(rawChar) || rawChar === '\u00a0') {
      if (!removeSpaces && !lastWasSpace && normalized.length > 0) {
        normalized += ' ';
        normToRaw.push(i);
        lastWasSpace = true;
      }
      continue;
    }

    let canonical = rawChar
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\u2010-\u2015]/g, '-')
      .replace(/[’‘]/g, "'")
      .replace(/[“”«»„]/g, '"');

    if (!canonical) {
      continue;
    }

    for (const ch of canonical) {
      if (removeSpaces && ch === ' ') {
        continue;
      }
      normalized += ch;
      normToRaw.push(i);
    }

    lastWasSpace = false;
  }

  if (!removeSpaces && normalized.endsWith(' ')) {
    normalized = normalized.slice(0, -1);
    normToRaw.pop();
  }

  return { normalized, normToRaw };
}

export function normalizeForSearch(input: string): string {
  return normalizeForSearchWithMap(input.trim()).normalized;
}

export function findMatchRawRange(fullText: string, searchText: string): MatchRange | null {
  const querySpaced = normalizeForSearch(searchText);
  if (!querySpaced) {
    return null;
  }

  const spacedText = normalizeForSearchWithMap(fullText);
  const spacedIdx = spacedText.normalized.indexOf(querySpaced);
  if (spacedIdx !== -1) {
    const endNorm = spacedIdx + querySpaced.length - 1;
    const startRaw = spacedText.normToRaw[spacedIdx];
    const endRawExclusive = (spacedText.normToRaw[endNorm] ?? startRaw) + 1;
    return { startRaw, endRawExclusive, mode: 'spaced' };
  }

  const queryCompact = normalizeForSearchWithMap(searchText.trim(), { removeSpaces: true }).normalized;
  if (!queryCompact) {
    return null;
  }

  const compactText = normalizeForSearchWithMap(fullText, { removeSpaces: true });
  const compactIdx = compactText.normalized.indexOf(queryCompact);
  if (compactIdx === -1) {
    return null;
  }

  const endNorm = compactIdx + queryCompact.length - 1;
  const startRaw = compactText.normToRaw[compactIdx];
  const endRawExclusive = (compactText.normToRaw[endNorm] ?? startRaw) + 1;
  return { startRaw, endRawExclusive, mode: 'compact' };
}
