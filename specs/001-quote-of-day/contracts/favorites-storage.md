# Browser Storage Contract: Favorites

## Location and Format

- Storage: browser localStorage for the page's current origin.
- Key: `quote-of-day.favorites`.
- Value: a JSON array of stable quote ID strings, for example `["quote-1", "quote-3"]`.
- Empty selection: `[]`; an absent key also means no saved favorites.
- Store only IDs, not quote text, current quote, messages, timestamps, or user accounts.

Order is not meaningful. Sort IDs lexicographically when serializing to simplify review.
The normal collection limits the saved set to five IDs. No schema version wrapper or migration
framework is needed for this feature.

## Reading

Acquire localStorage and call `getItem` inside a guarded operation. A missing key is a successful
empty result. Parse present values and require an array. Retain only known string IDs and deduplicate
using a Set. Leave saved data untouched during reading, including invalid data.

| Condition | Result | Next favorite action |
|-----------|--------|----------------------|
| Missing key or valid empty array | Empty Set, no warning | Calculate and save a toggle |
| Valid known IDs | Restored Set, no warning | Calculate and save a toggle |
| Mixed known/unknown/duplicate/wrong-type entries | Valid deduplicated subset | Calculate and save a toggle from valid subset |
| Malformed JSON or wrong top-level shape | Empty Set, invalid-data warning | Explicit successful toggle can replace invalid content |
| Getter or read throws | Provisional empty Set, restore-failed warning, `needsRestore: true` | Acquire storage and retry reading before considering a write |

Never treat a storage-access exception as proof that there are no previously saved favorites.

## Writing and Retry

1. Acquire storage afresh so a previously unavailable provider can recover.
2. Serialize a candidate Set of known IDs.
3. Call `setItem` for the single key inside the guarded operation.
4. Return success only if the write completed. Only then commit the candidate in page memory.
5. On failure, preserve the previous Set and report save failure. Do not remove or clear the key.

The existing favorite control retries the toggle because the prior Set was retained. If restoring
was unavailable initially, the controller must retry a read first and preserve other restored IDs
when applying the requested change. Concurrent-tab merging is outside the specification.

## Persistence Boundary

Use the same scheme, hostname, and port during verification: `http://127.0.0.1:8000/`. Another
origin has its own selections. Reloading must restore favorites, while the current quote may change.
Cleared site data, private-session expiry, and other devices are outside the persistence guarantee.

Browser API behavior supporting this contract is documented in [research.md](../research.md).
This is a browser storage contract, not a database schema or network API.
