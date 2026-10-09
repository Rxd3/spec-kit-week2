# User Interface Contract: Quote of the Day

## Page Surface

The entry document is `index.html`. It includes one heading "Quote of the Day", one quote text
region, a button labeled "New quote", one favorite toggle button, and an inline status region.
There is no additional page, favorites list, account prompt, or quote-fetching integration.

| Element | Required behavior |
|---------|-------------------|
| `#quote-text` | Displays one complete quote as text; never interpolates quote content as HTML |
| `#new-quote` | Native button labeled "New quote"; selects another eligible quote without page navigation |
| `#favorite-toggle` | Native button; "Favorite" when unselected, "Unfavorite" when selected; matching `aria-pressed` |
| `#status-message` | Plain-language storage warning or error; empty after a successful save |

Use semantic HTML and visible focus styles for the existing controls. Styling must allow quote
text to wrap on narrow screens without hiding controls. This does not introduce new functionality.

The different button labels provide the required visible non-color cue for FR-004. Saved and
unsaved states must remain distinguishable with the pointer away and focus removed; neither a
hover/focus effect, color change alone, `aria-pressed` alone, nor a temporary message is sufficient.
Selected styling supplements the label. No separate badge or additional control is required.

## Interaction Contract

- On each load, select one of the five usable built-in quotes at random and restore favorites.
- "New quote" excludes the current ID when other candidates exist. Prior quotes remain eligible.
- The favorite action changes only the current quote's selected state. It does not select a quote.
- Change the displayed saved state only after localStorage accepts the write.
- Loading another quote or clicking rapidly never changes favorites or creates extra quote regions.
- Returning to a saved quote through "New quote" or after reload immediately restores "Unfavorite",
  the selected appearance, and `aria-pressed="true"` before another favorite action. Returning to
  an unsaved quote immediately restores "Favorite", the unselected appearance, and `false`.
- If only one quote is usable, requesting another retains it. If none are usable, show
  "No quotes are available." and disable both action buttons.

## Error and Recovery Contract

- Storage access/read failure: "Favorites could not be restored. Try the favorite button again."
- Invalid saved JSON or a non-array value: "Saved favorites could not be read. You can save a new selection."
- Save failure: "This change could not be saved. Try the favorite button again."
- Keep quote viewing and "New quote" working through storage errors. Do not clear a warning merely
  because a different quote is shown. Clear it when the user completes a successful save.
- After a failed initial read, retry loading before any write to preserve existing favorites.
- Ignore unusable entries in a readable array and retain valid entries; this is not a total restore failure.

## Initialization Contract for Verification

`initializePage(document, options)` is exported by `app.js`. Optional inputs are `quotes`, `random`,
and `getStorage`, with production defaults to the five built-in quotes, Math.random, and access
to that document's browser localStorage. It returns `destroy()`, which removes attached listeners.
The module exports its normally initialized instance as `page`.

This boundary lets a browser walkthrough replace the normal instance after `page.destroy()` with
controlled collections or storage failures while using the actual page markup. Do not add test
buttons, query-parameter switches, a preferences screen, or a second rendering implementation.
Reloading restores the normal instance. Logic tests import `quote-state.js`, not the DOM module.

## Requirement Coverage

Normal rendering: FR-001/002; quote browsing: FR-003/006; favorites: FR-004/005; failure/fallback
behavior: FR-007/008; scope: FR-009. Recorded walkthroughs satisfy the evidence required by FR-010.
