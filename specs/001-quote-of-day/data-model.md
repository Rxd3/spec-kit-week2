# Data Model: Quote of the Day

## Quote

| Field | Type | Rule |
|-------|------|------|
| `id` | String | Stable, unique, nonempty identity such as `quote-1` |
| `text` | String | Nonempty after trimming; plain text |

The normal collection contains exactly five distinct quotes with IDs `quote-1` through `quote-5`.
Keep IDs stable when changing order
or text. Ignore unusable records when deriving the displayable collection; duplicate IDs or text
retain only their first usable occurrence. Tests cover zero and one usable record as fallback cases.
No author, category, remote identifier, or date field is required.

## Favorite Selection

Represent usable favorites in memory as a Set of known quote IDs. Persist them as a JSON array
of strings under the one key documented in [favorites-storage.md](contracts/favorites-storage.md).

- Each ID identifies one quote; duplicates do not create additional selections.
- Unknown IDs and non-string entries are ignored on load.
- Missing storage key is a successful empty selection.
- Malformed JSON or a non-array value is an invalid-data warning with an empty usable selection.
- An unavailable getter/read is a restore-failed warning with an empty provisional selection and
  `needsRestore: true`. Retry restoration before constructing a candidate toggle.
- Startup does not write, delete, or repair stored data.

## Page State

| Field | Type | Purpose |
|-------|------|---------|
| `currentQuote` | Quote or null | Exactly one displayed quote; null only for an empty usable collection |
| `favorites` | Set of strings | Last successfully restored or saved usable selections |
| `needsRestore` | Boolean | Initial storage access/read failed; restoration must be retried before saving |
| `error` | Null or error code | Restore failure, invalid data, or save failure mapped to a plain-language status |

Page state is temporary. Only successfully saved favorite IDs survive reload. Current quote,
random samples, and status messages are not saved. Do not add pending favorite state or a retry queue.

## Transitions

1. **Initialize**: Validate usable quotes, attempt favorite restoration, choose any usable quote
   randomly, and render its text/favorite state plus any restoration warning.
2. **Request quote**: Choose from usable quotes excluding the current ID when alternatives exist.
   Render the selected quote and its own favorite state. Do not write favorites or clear errors.
3. **Toggle favorite**: If no current quote exists, do nothing. If `needsRestore` is true, retry
   restoration first; on another read failure, show the warning and stop without writing. If restored,
   compute the toggle from restored state. Invalid but readable data can use an empty baseline.
4. **Save succeeds**: Replace the in-memory Set with the candidate, clear the storage warning,
   and render selected/unselected state. The displayed quote is unchanged.
5. **Save fails**: Preserve the prior Set and displayed quote, show the save error, and allow
   another click to retry. The saved storage value remains unchanged.
6. **Reload**: Discard page state, restore saved IDs again, and make a new random quote selection.
7. **No usable quotes**: Display the unavailable message and disable both action buttons. One
   usable quote stays visible when "New quote" is activated.

## Testable Logic Boundaries

All functions below live in `quote-state.js`, without top-level access to `window` or `document`.

| Function | Inputs | Observable result |
|----------|--------|-------------------|
| `getUsableQuotes` | Quote records | Valid distinct records in original order |
| `selectQuote` | Usable records, current ID or null, random function | Eligible Quote or null |
| `toggleFavorite` | Current Set, known current quote ID | New Set with only that ID toggled; original Set unchanged |
| `loadFavorites` | Storage provider, known IDs | `{ favorites, error, needsRestore }` |
| `saveFavorites` | Candidate Set, storage provider | `{ ok, error }`; guarded write, no mutation of caller state |

A storage provider is a function returning an object with `getItem` and `setItem`; the production
provider accesses browser localStorage, and tests supply an in-memory or throwing implementation.
A random function returns a number in the Math.random interval, from zero inclusive to one exclusive.
