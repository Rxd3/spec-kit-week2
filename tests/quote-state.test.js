import test from 'node:test';
import assert from 'node:assert/strict';
import * as state from '../quote-state.js';

test('built-in collection contains five distinct valid quotes with stable IDs', () => {
  assert.equal(state.QUOTES.length, 5);
  assert.deepEqual(state.QUOTES.map(quote => quote.id),
    ['quote-1', 'quote-2', 'quote-3', 'quote-4', 'quote-5']);
  assert.equal(new Set(state.QUOTES.map(quote => quote.text)).size, 5);
  assert.deepEqual(state.getUsableQuotes(state.QUOTES), state.QUOTES);
});

test('unusable and duplicate records are ignored, retaining the first valid occurrence', () => {
  const first = { id: 'a', text: 'A thought.' };
  const second = { id: 'b', text: 'Another thought.' };
  assert.deepEqual(state.getUsableQuotes([
    null, {}, { id: '', text: 'Empty ID' }, { id: '  ', text: 'Blank ID' },
    { id: 1, text: 'Wrong ID type' }, { id: 'bad', text: 12 },
    { id: 'bad', text: '   ' }, first,
    { id: 'a', text: 'Duplicate ID' }, { id: 'other', text: first.text }, second,
  ]), [first, second]);
});

test('every quote is eligible for initial selection', () => {
  state.QUOTES.forEach((quote, index) => {
    const sample = (index + 0.5) / state.QUOTES.length;
    assert.equal(state.selectQuote(state.QUOTES, null, () => sample), quote);
  });
});

test('selection covers zero and just below one', () => {
  assert.equal(state.selectQuote(state.QUOTES, null, () => 0), state.QUOTES[0]);
  assert.equal(state.selectQuote(state.QUOTES, null, () => 1 - Number.EPSILON), state.QUOTES[4]);
});

test('empty selection returns null without sampling randomness', () => {
  assert.equal(state.selectQuote([], null, () => { throw new Error('Should not sample'); }), null);
});

test('one quote remains selectable', () => {
  assert.equal(state.selectQuote([state.QUOTES[0]], null, () => 0.9), state.QUOTES[0]);
});

test('each current quote is excluded and every remaining quote is eligible', () => {
  for (const current of state.QUOTES) {
    const expected = state.QUOTES.filter(quote => quote.id !== current.id);
    expected.forEach((quote, index) => {
      const sample = (index + 0.5) / expected.length;
      assert.equal(state.selectQuote(state.QUOTES, current.id, () => sample), quote);
    });
  }
});

test('previously seen quotes remain eligible, rather than a one-pass history', () => {
  const first = state.selectQuote(state.QUOTES, null, () => 0);
  const second = state.selectQuote(state.QUOTES, first.id, () => 0);
  assert.notEqual(first.id, second.id);
  assert.equal(state.selectQuote(state.QUOTES, second.id, () => 0), first);
});

test('repeated selections handle empty and one-quote collections', () => {
  for (let index = 0; index < 20; index++) {
    assert.equal(state.selectQuote([], 'missing', () => 0), null);
    assert.equal(state.selectQuote([state.QUOTES[0]], state.QUOTES[0].id, () => 0), state.QUOTES[0]);
  }
});

const storageKey = 'quote-of-day.favorites';
const knownIds = state.QUOTES.map(quote => quote.id);

function memoryStorage(initial = null) {
  let value = initial;
  let writes = 0;
  return {
    getItem(key) { assert.equal(key, storageKey); return value; },
    setItem(key, next) { assert.equal(key, storageKey); value = next; writes++; },
    get value() { return value; },
    get writes() { return writes; },
  };
}

test('favorite toggles affect one ID and leave the original Set unchanged', () => {
  const original = new Set(['quote-1']);
  const selected = state.toggleFavorite(original, 'quote-2');
  assert.notEqual(selected, original);
  assert.deepEqual([...original], ['quote-1']);
  assert.deepEqual([...selected], ['quote-1', 'quote-2']);
  assert.deepEqual([...state.toggleFavorite(selected, 'quote-2')], ['quote-1']);
});

test('repeated toggles never create duplicate selections', () => {
  let favorites = new Set();
  for (let index = 0; index < 10; index++) {
    favorites = state.toggleFavorite(favorites, 'quote-1');
    assert.equal(favorites.size, (index + 1) % 2);
  }
});

test('missing key and empty array restore an empty selection without writes', () => {
  for (const initial of [null, '[]']) {
    const storage = memoryStorage(initial);
    const result = state.loadFavorites(() => storage, knownIds);
    assert.equal(result.favorites.size, 0);
    assert.equal(result.error, null);
    assert.equal(result.needsRestore, false);
    assert.equal(storage.writes, 0);
  }
});

test('restoration retains known IDs and ignores duplicates, unknown IDs, and wrong types', () => {
  const storage = memoryStorage('["quote-3", "unknown", "quote-1", "quote-3", 42, null, {}]');
  const result = state.loadFavorites(() => storage, knownIds);
  assert.deepEqual([...result.favorites], ['quote-3', 'quote-1']);
  assert.equal(result.error, null);
  assert.equal(result.needsRestore, false);
  assert.equal(storage.writes, 0);
});

test('malformed JSON and non-array values report invalid data without overwriting it', () => {
  for (const initial of ['not-json', '{}', 'null', '42', '"quote-1"']) {
    const storage = memoryStorage(initial);
    const result = state.loadFavorites(() => storage, knownIds);
    assert.equal(result.favorites.size, 0);
    assert.equal(result.error, 'invalid-data');
    assert.equal(result.needsRestore, false);
    assert.equal(storage.value, initial);
    assert.equal(storage.writes, 0);
  }
});

test('provider and read exceptions require restoration rather than assuming empty data', () => {
  const providers = [
    () => { throw new Error('Access denied'); },
    () => ({ getItem() { throw new Error('Read failed'); } }),
  ];
  for (const provider of providers) {
    const result = state.loadFavorites(provider, knownIds);
    assert.equal(result.error, 'restore-failed');
    assert.equal(result.needsRestore, true);
    assert.equal(result.favorites.size, 0);
  }
});

test('saving sorts IDs and does not mutate the candidate Set', () => {
  const storage = memoryStorage();
  const favorites = new Set(['quote-3', 'quote-1']);
  assert.deepEqual(state.saveFavorites(favorites, () => storage), { ok: true, error: null });
  assert.equal(storage.value, '["quote-1","quote-3"]');
  assert.deepEqual([...favorites], ['quote-3', 'quote-1']);
  assert.equal(storage.writes, 1);
});

test('multiple favorites and a removal survive repeated restoration', () => {
  const storage = memoryStorage();
  let favorites = new Set(['quote-1', 'quote-2', 'quote-3']);
  assert.equal(state.saveFavorites(favorites, () => storage).ok, true);
  for (let reload = 0; reload < 5; reload++) {
    favorites = state.loadFavorites(() => storage, knownIds).favorites;
    assert.deepEqual([...favorites], ['quote-1', 'quote-2', 'quote-3']);
  }
  favorites = state.toggleFavorite(favorites, 'quote-2');
  state.saveFavorites(favorites, () => storage);
  for (let reload = 0; reload < 5; reload++) {
    assert.deepEqual([...state.loadFavorites(() => storage, knownIds).favorites], ['quote-1', 'quote-3']);
  }
});

test('failed writing preserves the previous stored value and allows a later retry', () => {
  const storage = memoryStorage('["quote-1"]');
  const candidate = new Set(['quote-1', 'quote-2']);
  let blocked = true;
  const provider = () => ({
    setItem(key, value) {
      if (blocked) throw new Error('Quota exceeded');
      storage.setItem(key, value);
    },
  });
  assert.deepEqual(state.saveFavorites(candidate, provider), { ok: false, error: 'save-failed' });
  assert.equal(storage.value, '["quote-1"]');
  blocked = false;
  assert.equal(state.saveFavorites(candidate, provider).ok, true);
  assert.equal(storage.value, '["quote-1","quote-2"]');
});

test('saving also handles exceptions from the storage provider', () => {
  const result = state.saveFavorites(new Set(['quote-1']), () => { throw new Error('Getter denied'); });
  assert.deepEqual(result, { ok: false, error: 'save-failed' });
});

test('a fresh provider acquisition can recover a failed restoration', () => {
  const storage = memoryStorage('["quote-1","quote-3"]');
  let blocked = true;
  const provider = () => {
    if (blocked) throw new Error('Temporarily unavailable');
    return storage;
  };
  assert.equal(state.loadFavorites(provider, knownIds).needsRestore, true);
  blocked = false;
  const restored = state.loadFavorites(provider, knownIds);
  assert.equal(restored.needsRestore, false);
  const candidate = state.toggleFavorite(restored.favorites, 'quote-2');
  assert.equal(state.saveFavorites(candidate, provider).ok, true);
  assert.equal(storage.value, '["quote-1","quote-2","quote-3"]');
});
