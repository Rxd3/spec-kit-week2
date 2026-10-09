# Quote of the Day

A small page for reading random quotes and keeping favorites in your browser.
Built with plain HTML, CSS, and JavaScript. No installation or build step is needed.

Each visit starts with one random quote from five built-in quotes. Click **New quote**
for another, **Favorite** to save a selection, and **Unfavorite** to remove it.
Saved selections remain marked when you revisit their quotes after reloading.

## Run locally

Use a current browser and Python 3 for the static preview. From the repository root:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/. Stop the preview with Ctrl+C.
This serves static files for development; the application runs entirely in the browser.

Favorites use localStorage, the browser's storage for this page. They survive reloads
in the same browser at the same address. Changing the hostname, port, or protocol
uses different storage. Clearing site data removes selections. Other devices and
private sessions do not share your favorites. Use the HTTP preview rather than
opening `index.html` directly so modules and persistence work consistently.

## Test

With Node.js 22 or later, run from the repository root:

```powershell
node --test
```

The tests use Node's built-in runner. There are no test packages to install.

## Files

| File | Responsibility |
|------|----------------|
| `index.html` | Page markup and controls |
| `styles.css` | Layout and visual states |
| `app.js` | Page rendering and interactions |
| `quote-state.js` | Built-in quotes, selection, and favorite storage logic |
| `tests/quote-state.test.js` | Automated behavior checks |

The [validation guide](specs/001-quote-of-day/quickstart.md) describes browser checks.
The [verification record](specs/001-quote-of-day/verification.md) contains actual
test and browser results, including persistence and failure recovery.
