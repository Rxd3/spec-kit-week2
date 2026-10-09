# Quickstart and Validation: Quote of the Day

## Status and Prerequisites

This is the validation guide for the planned implementation. Application and test files are not
created by `$speckit-plan`; run the commands after `$speckit-implement` creates them. No checks
below have been executed against an application during planning.

Prerequisites: a current browser, Node.js 22 or later for built-in automated tests, and Python 3
for a local static preview. This workspace has Node v22.16.0 and Python 3.13.5. There is no package
installation, build command, framework, application backend, database, or external API.

From a PowerShell terminal:

```powershell
Set-Location 'C:\Users\Rasheed\Downloads\DDL\ai-native-week1\spec-kit-week2'
node --version
python --version
node --test
python -m http.server 8000 --bind 127.0.0.1
```

Leave the static preview command running, then open `http://127.0.0.1:8000/`. Stop it with Ctrl+C.
The command only serves static files for development; all application logic runs in the browser.
Keep this exact scheme, host, and port across reloads. Do not verify persistence with a `file:` URL.
If port 8000 is busy, stop the prior preview or choose another port and use it consistently.

## Automated Logic Checks

Run `node --test` from the repository root. All tests must pass with no third-party test tools.
The planned `tests/quote-state.test.js` imports `quote-state.js` and tests:

- The normal collection has five unique IDs and distinct nonempty texts; unusable records and
  duplicate records are filtered consistently.
- Initial selection can reach each usable quote with controlled random samples. Test zero and a
  value just below one as selection boundaries rather than relying on chance or statistical counts.
- For every current ID, all other quotes are eligible, the current quote is excluded, and previously
  seen quotes can reappear. Empty and one-quote collections do not loop or throw.
- Favorite toggles return a new Set, affect only one ID, and deduplicate selections.
- Save/restore round trips retain multiple selections and removals.
- Missing keys, mixed valid/unknown IDs, duplicates, non-string entries, malformed JSON, and
  wrong top-level shapes follow [the storage contract](contracts/favorites-storage.md).
- Throwing storage providers/readers produce a restoration error without a write; throwing
  writers preserve the previous stored value. A later successful attempt persists the intended change.

Do not add tests that merely check CSS values or mirror private implementation steps. Browser
walkthroughs below establish the DOM integration, production storage provider, and real reloads.

## Browser Walkthrough: Normal Interactions

Use a dedicated local testing origin. Clear only this feature's key before the first scenario:

```javascript
localStorage.removeItem('quote-of-day.favorites');
location.reload();
```

| Scenario | Actions | Expected outcome |
|----------|---------|------------------|
| Initial display, SC-001 | Load/reload five times | Heading says "Quote of the Day"; exactly one complete built-in quote and its favorite state are visible on every load |
| Browse, SC-002 | Activate "New quote" 20 times, recording each displayed quote | Each differs from the immediately preceding one; one quote remains visible; no navigation or full reload occurs |
| Rapid browsing | Activate "New quote" rapidly several times | One complete quote remains visible; selected state belongs to that quote |
| Mark a favorite | Activate "Favorite" on an unselected quote | Text stays unchanged; control becomes "Unfavorite" and pressed; its ID is saved once |
| Multiple favorites, SC-003 | Browse and mark three distinct quotes; record their IDs | All three independent selections are retained; no duplicates |
| Reload persistence, SC-003 | Reload five times at the same origin; inspect saved IDs and revisit each selected quote | The three IDs remain saved on every reload and each selected quote displays its correct state |
| Remove and reload, SC-003 | Unfavorite one of those quotes, then reload five times and revisit all three | Removed quote stays unselected; the other two remain selected |
| Browsing preserves favorites | With selections saved, activate "New quote" 20 times | The saved selections remain unchanged and each shown quote has its correct state |

Use browser DevTools Application/Storage or this read-only expression to inspect saved IDs:

```javascript
JSON.parse(localStorage.getItem('quote-of-day.favorites') || '[]');
```

The current quote need not be the same after reload. Verify its state against the saved IDs. Native
controls must work using the keyboard as well as a pointer, and remain visible on a narrow screen.

## Targeted Check: Visible Saved and Unsaved States (T024)

This follow-up check verifies the clarified FR-004/FR-006 and SC-003. The older passing results
remain evidence for the original baseline; do not mark this check passed without executing it.

1. With no saved favorites, choose quote A. Move the pointer away and remove focus from the
   favorite control. Confirm the visible "Favorite" label and unselected appearance.
2. Save A successfully. Move the pointer away and remove focus again. Confirm "Unfavorite" and
   the persistent selected appearance, with A's text unchanged. The words distinguish the state
   even if background/border colors are ignored; hidden `aria-pressed` alone is not sufficient.
3. Use "New quote" to reach an unsaved quote B. Confirm "Favorite" and the unselected appearance.
   Continue until A returns. Before touching its favorite control, confirm "Unfavorite" and the
   selected appearance have returned automatically. Saved IDs must not change during browsing.
4. Reload at the same origin and revisit A. Confirm the same saved indication automatically.
5. Unfavorite A successfully. Confirm "Favorite" immediately. Browse away and back, then reload
   and revisit A. Each return must show the unsaved indication without another favorite action.
6. Using the existing controlled write-failure walkthrough, attempt a save and a removal. The
   error must appear while the last successful visible state remains unchanged. A successful
   retry must update the persistent indication.

Check both states at desktop and narrow widths. If random browsing makes a particular revisit
slow, use the documented injected `random` function to exercise a deterministic A/B/A sequence
with real storage and the existing page markup. Capture both saved and unsaved appearances at
rest, and record labels, observed state on each return, and storage preservation in
`specs/001-quote-of-day/verification.md`. This is a verification task; application and test code
remain unchanged during the specification clarification.

## Browser Walkthrough: Controlled Data and Failures

These scenarios use the real page markup and the initialization boundary described in the
[UI contract](contracts/user-interface.md). They do not add visible testing features to the page.
For each scenario, start with a normal reload and this DevTools setup:

```javascript
var quoteApp = await import('/app.js');
quoteApp.page.destroy();
```

`destroy()` removes listeners from the normal instance before a controlled instance attaches its
own. Reload after each controlled scenario to return to the normal application. Use no duplicate
initializers without destroying the previous instance. If inspecting a specific quote is necessary,
pass a fixed `random` sample to choose it; this does not write or change favorites.

### Empty and Single-Quote Collections

Initialize with an empty collection:

```javascript
var quoteCase = quoteApp.initializePage(document, { quotes: [] });
```

Expect "No quotes are available." and both controls disabled. No quote selection or storage write
occurs on disabled actions. Record the result and reload.

After the normal DevTools setup, initialize with one built-in quote:

```javascript
var quoteData = await import('/quote-state.js');
var quoteCase = quoteApp.initializePage(document, { quotes: quoteData.QUOTES.slice(0, 1) });
```

Activate "New quote" several times. The same complete quote remains visible without error, and
its favorite control still works. To test filtering, pass a collection containing one valid quote
and entries with missing/empty text or duplicate IDs; only the usable quote may appear.

### Invalid Saved Data

For each row, replace only the feature key using DevTools, then reload normally:

| Saved value | Expected result |
|-------------|-----------------|
| `[]` or absent key | All quotes unselected; no restoration error |
| `["quote-1", "unknown", "quote-1", 42]` | `quote-1` restored; unknown/non-string IDs ignored; no duplicate selection |
| `{}` | Restoration warning; quote browsing remains usable; no automatic storage overwrite |
| `not-json` | Restoration warning; quote browsing remains usable; no automatic storage overwrite |

Example setup for malformed JSON:

```javascript
localStorage.setItem('quote-of-day.favorites', 'not-json');
location.reload();
```

For invalid data, verify that the warning is cleared only after a successful explicit favorite
change, and that the new selection persists after reload. For a mixed valid array, revisit the
valid quote to confirm its selected state. Restore a normal selection before failure checks.

### Write Failure and Successful Retry

First save at least two favorites normally and record the stored value. Perform the normal
DevTools setup, then provide real reads with a controllably failing write:

```javascript
var quoteWriteBlocked = true;
var quoteCase = quoteApp.initializePage(document, {
  getStorage: () => ({
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => {
      if (quoteWriteBlocked) throw new Error('Simulated storage write failure');
      localStorage.setItem(key, value);
    }
  })
});
```

Activate the favorite control. Expect the save-failure message, unchanged selected state and saved
value, and usable quote browsing. Record the current quote and existing selections. Set
`quoteWriteBlocked = false` and activate the same quote's favorite control again. Expect that one
toggle to save, other selections to remain intact, and the error to clear. Reload normally and
verify the saved result. Repeat failure with an already selected quote to verify failed removal.

### Getter or Read Failure and Successful Restoration

Seed a known selection normally and record it. Perform the normal DevTools setup, then initialize:

```javascript
var quoteReadBlocked = true;
var quoteCase = quoteApp.initializePage(document, {
  getStorage: () => {
    if (quoteReadBlocked) throw new Error('Simulated storage access failure');
    return localStorage;
  }
});
```

Expect a restoration warning; viewing and "New quote" still work. A favorite action while blocked
must neither write nor claim a saved change. Set `quoteReadBlocked = false`, then activate the
favorite control. Expect restoration before toggling: other previously saved favorites remain,
the current quote is toggled exactly once, and the warning clears after the successful save.
Reload normally to verify persistence.

Repeat with a provider returning an object whose `getItem` throws to cover a read-operation failure
as distinct from the provider/getter failure. Repeat with a write error named `QuotaExceededError`;
it must follow the same write-failure behavior. These controlled failures verify rendering and
recovery without depending on the browser's quota or changing global browser settings.

## Evidence and Completion Gate

Create `specs/001-quote-of-day/verification.md` during implementation. Include the browser/version,
fixed origin, collection/setup used, test command and results, and a row for each walkthrough:

| Scenario / requirement | Setup and actions | Expected result | Observed result | Pass/fail |
|------------------------|-------------------|-----------------|-----------------|-----------|

Record the five initial loads, 20 browse actions, three favorites over five reloads, one removal
over another five reloads, and all controlled failure/recovery outcomes. Map evidence to the
acceptance scenarios and SC-001 through SC-005. Link screenshots when they clarify a failure.

All main interactions and specified edge cases must pass before delivery is marked complete.
An unrun walkthrough is pending, not passing. Automated logic checks alone do not satisfy FR-010.
