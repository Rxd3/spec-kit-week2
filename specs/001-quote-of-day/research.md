# Research: Quote of the Day

**Date**: 2026-10-09
**Scope**: Resolve implementation and verification choices for the existing specification.

No unresolved technical clarifications remain. The user explicitly chose plain HTML, CSS,
JavaScript, localStorage, and no frameworks, backend, databases, or external APIs.

## 1. Native Modules and a Minimal Structure

**Decision**: Use `index.html`, `styles.css`, `app.js`, and `quote-state.js`. Put data and pure
selection/favorite helpers plus small guarded persistence helpers in `quote-state.js`. Put DOM
rendering and events in `app.js`. Declare `type: module` in private package metadata.

**Rationale**: Native modules require no bundler. One logic module can be imported by both browser
code and Node tests without top-level browser globals. Two JS files keep responsibilities clear
without adding models/services/repositories. Package metadata is not a package dependency.

**Alternatives considered**: One monolithic script makes business behavior harder to test. More
layers are unnecessary for five quotes. `.mjs` would also work, but standard `.js` files with one
module declaration keep file naming familiar. React, other frameworks, and bundlers are excluded.

**Sources**: [MDN JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
[Node 22.16 ES modules](https://nodejs.org/download/release/v22.16.0/docs/api/esm.html).

## 2. Random Selection Without Immediate Repeats

**Decision**: Filter out the current quote when alternatives exist, then use one Math.random
sample to choose a candidate. Inject a random function for deterministic tests. Empty input returns
no quote; one quote remains displayable. Do not retain browsing history.

**Rationale**: Every remaining quote is eligible, previous quotes can reappear, and a selection
cannot get stuck repeatedly drawing the current quote. This is a design inference from FR-002/003.

**Alternatives considered**: Retrying random selection can loop indefinitely under a deterministic
source. A shuffled queue changes the requirement by preventing earlier repeats until exhaustion.

## 3. Persist IDs on a Fixed Origin

**Decision**: Store a JSON array of stable IDs under `quote-of-day.favorites` using localStorage
`getItem` and `setItem`. Do not store whole quotes or the current displayed quote.

**Rationale**: IDs keep favorites independent of text/order and avoid duplicating built-in content.
localStorage is scoped to the browser origin and normally persists across reloads. Behavior for
`file:` URLs is undefined, so use a fixed HTTP origin for dependable verification.

**Alternatives considered**: Full quote objects duplicate data. Session storage does not provide
the chosen persistence semantics. Databases, accounts, and external storage are excluded.

**Sources**: [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage),
[MDN Web Storage guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API).

## 4. Validation, Save Failures, and Recovery

**Decision**: Catch storage getter/read/write failures and JSON parsing errors. Missing data means
no favorites. For an array, retain known string IDs and discard duplicates or unusable entries.
Malformed JSON or a non-array shape yields an empty usable selection with a restoration warning.
Do not rewrite stored data while loading it.

Compute a candidate favorite selection, serialize, write, and only then commit it in memory.
A failed write retains the prior saved state and shows an error; the existing favorite control
retries the same toggle. Acquire storage afresh each time. If initial storage access/read failed,
retry the read before writing so temporarily unreadable saved favorites are not silently replaced.
Readable malformed data can be replaced only by a later successful explicit favorite action.

**Rationale**: The localStorage getter may throw SecurityError and writes may throw
QuotaExceededError. The storage standard checks write failure before replacing the old value.
The application's validation and retry policy preserve saved selections and satisfy FR-007/008;
the policy itself is an inference, not a requirement imposed by the browser documentation.

**Alternatives considered**: Optimistically updating the selected state can claim an unsaved
change succeeded. Silently clearing malformed data removes recovery options. A retry queue or
extra retry button adds unnecessary scope.

**Sources**: [HTML Web Storage standard](https://html.spec.whatwg.org/multipage/webstorage.html),
[Storage setItem algorithm](https://html.spec.whatwg.org/multipage/webstorage.html#dom-storage-setitem),
[MDN JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).

## 5. Dependency-Free Verification

**Decision**: Use `node:test` with `node:assert/strict`, run via `node --test`. Inject controlled
random samples and storage objects to test observable outcomes, not implementation internals.
Record actual browser walkthroughs for all main interactions and failure/recovery UI states.
Expose only initialization inputs and listener cleanup for isolated manual browser checks.

**Rationale**: Node v22.16.0 is available, and its test runner is stable. No test packages or
simulated DOM are required. Logic tests cannot establish rendering or real reload persistence,
so browser walkthroughs remain a completion gate.

**Alternatives considered**: Jest, Vitest, DOM emulation, and browser automation packages would
add dependencies and setup. Manual checks alone would miss inexpensive deterministic logic tests.

**Sources**: [Node 22.16 test runner](https://nodejs.org/download/release/v22.16.0/docs/api/test.html).

## 6. Local Static Serving

**Decision**: For development only, run `python -m http.server 8000 --bind 127.0.0.1` from the
repository root and browse `http://127.0.0.1:8000/`. Keep scheme, host, and port fixed when testing
favorites. Python 3.13.5 is already installed; no new package or custom server is required.

**Rationale**: HTTP serves native module files normally and provides a stable storage origin.
This command only serves static files; all application behavior and storage stay in the browser.
The application has no backend or runtime dependency on Python.

**Alternatives considered**: Direct file opening cannot reliably verify modules/localStorage.
An existing static preview is acceptable if it uses the same fixed-origin discipline. A custom
application server is unnecessary and outside the user's requirements.

**Sources**: [Python static serving](https://docs.python.org/3/library/http.server.html),
[MDN JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
