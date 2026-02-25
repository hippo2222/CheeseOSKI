import test from 'node:test';
import assert from 'node:assert/strict';
import { findMatchRawRange, normalizeForSearch } from './pdf-search-highlight';

test('normalizeForSearch collapses spaces and lowercases', () => {
  assert.equal(normalizeForSearch('  Foo   BAR \n baz '), 'foo bar baz');
});

test('findMatchRawRange finds exact spaced match', () => {
  const text = 'alpha beta gamma';
  const match = findMatchRawRange(text, 'beta ga');
  assert.ok(match);
  assert.equal(text.slice(match!.startRaw, match!.endRawExclusive), 'beta ga');
  assert.equal(match!.mode, 'spaced');
});

test('findMatchRawRange falls back to compact mode when PDF text loses spaces', () => {
  const text = 'катетеризаціясечовогоміхура';
  const match = findMatchRawRange(text, 'катетеризація сечового міхура');
  assert.ok(match);
  assert.equal(match!.mode, 'compact');
});

test('findMatchRawRange normalizes unicode dashes and quotes', () => {
  const text = '“Foley—catheterization” procedure';
  const match = findMatchRawRange(text, '"foley-catheterization"');
  assert.ok(match);
});

test('findMatchRawRange returns null when not found', () => {
  assert.equal(findMatchRawRange('abc def', 'zzz'), null);
});
