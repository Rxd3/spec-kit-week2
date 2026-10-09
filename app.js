import {
  QUOTES, getUsableQuotes, selectQuote, toggleFavorite, loadFavorites, saveFavorites,
} from './quote-state.js';

const ERROR_MESSAGES = {
  'restore-failed': 'Favorites could not be restored. Try the favorite button again.',
  'invalid-data': 'Saved favorites could not be read. You can save a new selection.',
  'save-failed': 'This change could not be saved. Try the favorite button again.',
};

export function initializePage(document, options = {}) {
  const quotes = getUsableQuotes(options.quotes ?? QUOTES);
  const random = options.random ?? Math.random;
  const getStorage = options.getStorage ?? (() => document.defaultView.localStorage);
  const knownIds = quotes.map(quote => quote.id);
  const quoteText = document.querySelector('#quote-text');
  const newQuoteButton = document.querySelector('#new-quote');
  const favoriteButton = document.querySelector('#favorite-toggle');
  const statusMessage = document.querySelector('#status-message');
  let currentQuote = selectQuote(quotes, null, random);
  let { favorites, error, needsRestore } = loadFavorites(getStorage, knownIds);

  function render() {
    quoteText.textContent = currentQuote?.text ?? 'No quotes are available.';
    quoteText.dataset.quoteId = currentQuote?.id ?? '';
    newQuoteButton.disabled = !currentQuote;
    const selected = !!currentQuote && favorites.has(currentQuote.id);
    favoriteButton.disabled = !currentQuote;
    favoriteButton.textContent = selected ? 'Unfavorite' : 'Favorite';
    favoriteButton.setAttribute('aria-pressed', String(selected));
    statusMessage.textContent = ERROR_MESSAGES[error] ?? '';
  }

  function showNewQuote() {
    currentQuote = selectQuote(quotes, currentQuote?.id, random);
    render();
  }

  function changeFavorite() {
    if (!currentQuote) return;

    // Restore before writing if earlier access failed, so unseen selections survive.
    if (needsRestore) {
      ({ favorites, error, needsRestore } = loadFavorites(getStorage, knownIds));
      if (needsRestore) {
        render();
        return;
      }
    }

    const candidate = toggleFavorite(favorites, currentQuote.id);
    const result = saveFavorites(candidate, getStorage);
    if (result.ok) favorites = candidate;
    error = result.error;
    render();
  }

  newQuoteButton.addEventListener('click', showNewQuote);
  favoriteButton.addEventListener('click', changeFavorite);
  render();
  return {
    destroy() {
      newQuoteButton.removeEventListener('click', showNewQuote);
      favoriteButton.removeEventListener('click', changeFavorite);
    },
  };
}

export const page = initializePage(document);
