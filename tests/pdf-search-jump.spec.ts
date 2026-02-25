import { test, expect } from '@playwright/test';
import pdfIndex from '../src/data/pdf-index.json';

type IndexEntry = {
  path: string;
  pages?: string[];
  text?: string;
};

function extractTokens(text: string): string[] {
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}\-]{2,}/gu) ?? [])
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= 3);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      unique.push(w);
    }
    if (unique.length >= 20) break;
  }
  return unique;
}

function buildQueriesFromPageText(text: string): string[] {
  const tokens = extractTokens(text).slice(0, 40);
  const queries: string[] = [];
  const seen = new Set<string>();

  for (let n = 4; n >= 1; n -= 1) {
    for (let i = 0; i <= tokens.length - n; i += 1) {
      const q = tokens.slice(i, i + n).join(' ').trim();
      if (q.length < 4) continue;
      if (seen.has(q)) continue;
      seen.add(q);
      queries.push(q);
      if (queries.length >= 120) return queries;
    }
  }

  return queries;
}

async function findNonFirstPageSearchCandidate(baseURL: string) {
  const entries = pdfIndex as IndexEntry[];
  const pool = entries.filter((e) => Array.isArray(e.pages) && e.pages.length > 1);

  for (const entry of pool) {
    const pages = entry.pages!;
    for (let pageIndex = 1; pageIndex < pages.length; pageIndex += 1) {
      const pageText = pages[pageIndex] ?? '';
      const queries = buildQueriesFromPageText(pageText);
      for (const query of queries) {
        const res = await fetch(`${baseURL}/api/pdf-search?q=${encodeURIComponent(query)}`);
        if (!res.ok) continue;
        const results = (await res.json()) as Array<{ path: string; page?: number; preview: string }>;
        const first = results[0];
        if (!first) continue;
        if (first.path === entry.path && (first.page ?? 1) === pageIndex + 1) {
          return {
            query,
            expectedPath: entry.path,
            expectedPage: pageIndex + 1,
          };
        }
      }
    }
  }

  throw new Error('No stable query found for a non-first-page PDF result');
}

test('pdf index contains page-level data (diagnostic)', async () => {
  const entries = pdfIndex as IndexEntry[];
  const multi = entries.filter((e) => Array.isArray(e.pages) && e.pages.length > 1);
  expect(multi.length).toBeGreaterThan(0);
});

test('clicking PDF search result jumps to non-first page and highlights text', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('baseURL is required');

  const candidate = await findNonFirstPageSearchCandidate(baseURL);

  const debugLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('PDFDBG')) debugLogs.push(text);
  });

  await page.addInitScript(() => {
    localStorage.setItem('pdfDebug', '1');
  });

  await page.goto('/');

  const searchInput = page.getByTestId('pdf-global-search-input');
  await searchInput.fill(candidate.query);

  const dropdown = page.getByTestId('pdf-global-search-dropdown');
  await expect(dropdown).toBeVisible();

  const firstResult = page.getByTestId('pdf-search-result-item').first();
  await expect(firstResult).toBeVisible();

  await firstResult.click();

  const scrollContainer = page.getByTestId('pdf-scroll-container');
  await expect(scrollContainer).toBeVisible();
  const beforeScrollTop = await scrollContainer.evaluate((el) => el.scrollTop);

  await page.waitForFunction(() => document.querySelectorAll('mark.bg-yellow-200').length > 0, null, {
    timeout: 45_000,
  });

  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="pdf-scroll-container"]');
      return !!el && (el as HTMLElement).scrollTop > 0;
    },
    null,
    { timeout: 45_000 }
  );

  const after = await scrollContainer.evaluate((el) => ({
    scrollTop: el.scrollTop,
    marks: document.querySelectorAll('mark.bg-yellow-200').length,
  }));

  expect(after.marks).toBeGreaterThan(0);
  expect(after.scrollTop).toBeGreaterThan(beforeScrollTop);

  expect(debugLogs.some((l) => l.includes('scroll.page.start'))).toBeTruthy();
  expect(debugLogs.some((l) => l.includes('highlight.attempt'))).toBeTruthy();
});
