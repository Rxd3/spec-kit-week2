export const QUOTES = [
  { id: 'quote-1', text: 'Small steps, taken with care, can carry you a long way.' },
  { id: 'quote-2', text: 'You do not need every answer to take the next good step.' },
  { id: 'quote-3', text: 'Make room for the quiet moments. They have something to say.' },
  { id: 'quote-4', text: 'A little curiosity can turn an ordinary day into a beginning.' },
  { id: 'quote-5', text: 'Let progress be a practice, rather than a finish line.' },
];

export function getUsableQuotes(quotes) {
  if (!Array.isArray(quotes)) return [];

  const ids = new Set();
  const texts = new Set();
  return quotes.filter(quote => {
    if (!quote || typeof quote.id !== 'string' || !quote.id.trim()
      || typeof quote.text !== 'string' || !quote.text.trim()) return false;
    if (ids.has(quote.id) || texts.has(quote.text.trim())) return false;
    ids.add(quote.id);
    texts.add(quote.text.trim());
    return true;
  });
}

export function selectQuote(quotes, currentId = null, random = Math.random) {
  if (quotes.length === 0) return null;
  const candidates = quotes.length > 1
    ? quotes.filter(quote => quote.id !== currentId)
    : quotes;
  return candidates[Math.floor(random() * candidates.length)];
}

const FAVORITES_KEY = 'quote-of-day.favorites';

export function toggleFavorite(favorites, quoteId) {
  const next = new Set(favorites);
  if (next.has(quoteId)) next.delete(quoteId);
  else next.add(quoteId);
  return next;
}

export function loadFavorites(getStorage, knownIds) {
  let saved;
  try {
    // The browser can throw even when acquiring localStorage, before any read.
    saved = getStorage().getItem(FAVORITES_KEY);
  } catch {
    return { favorites: new Set(), error: 'restore-failed', needsRestore: true };
  }

  if (saved === null) {
    return { favorites: new Set(), error: null, needsRestore: false };
  }

  try {
    const ids = JSON.parse(saved);
    if (!Array.isArray(ids)) throw new Error('Expected favorite IDs');
    const validIds = new Set(knownIds);
    const favorites = new Set(ids.filter(id => typeof id === 'string' && validIds.has(id)));
    return { favorites, error: null, needsRestore: false };
  } catch {
    return { favorites: new Set(), error: 'invalid-data', needsRestore: false };
  }
}

export function saveFavorites(favorites, getStorage) {
  try {
    getStorage().setItem(FAVORITES_KEY, JSON.stringify([...favorites].sort()));
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: 'save-failed' };
  }
}
