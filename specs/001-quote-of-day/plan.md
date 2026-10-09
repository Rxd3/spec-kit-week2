# Implementation Plan: Quote of the Day

**Branch**: `main` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-quote-of-day/spec.md`

**Feature identifier**: `001-quote-of-day`. The setup script reports this directory name as its
branch context; the actual Git branch remains `main`. No branch hook is configured.

## Summary

Build one static page using plain HTML, CSS, and JavaScript. It displays one of five built-in
quotes, selects a different random quote on "New quote", and lets the visitor toggle favorites.
Save only favorite quote IDs in browser localStorage. Keep quote selection, favorite changes, and
storage validation separate from page rendering so they can be tested without a browser.

Use no React, frameworks, application backend, databases, external APIs, or third-party packages.
Deliver only the specified interactions; no accounts, favorites list, or daily scheduler.

## Technical Context

**Language/Version**: HTML5, CSS, and modern JavaScript with native ES modules; no transpilation.

**Primary Dependencies**: None. Native DOM, Math.random, JSON, Set, and localStorage only.

**Storage**: Browser localStorage, key `quote-of-day.favorites`, containing a JSON array of stable
quote IDs. Current quote and messages remain in memory.

**Testing**: Node's built-in `node:test` and `node:assert/strict` for logic and storage behavior;
recorded walkthroughs in an actual browser for rendering, interactions, reloads, and failure states.
Node v22.16.0 and Python 3.13.5 are installed in the current workspace environment.

**Target Platform**: Current desktop and mobile browsers supporting native ES modules and Web
Storage. Use one fixed HTTP origin for persistence verification.

**Project Type**: Static browser application with no build step.

**Performance Goals**: Synchronous selection/rendering over five quotes; one small storage write
per successful toggle. No quote-fetching network requests or full page reload on button activation.
Acceptance uses SC-001 through SC-005; no additional performance benchmark is required.

**Constraints**: Plain HTML/CSS/JavaScript; browser localStorage; zero package dependencies; no
backend, databases, external APIs, frameworks, remote assets, or speculative abstractions.

**Scale/Scope**: One page, five distinct nonempty quotes, at most five stored favorite IDs per
browser origin. Cross-device and concurrent-tab synchronization are outside scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle or constraint | Pre-research gate | Post-design gate |
|-------------------------|-------------------|------------------|
| I. Clean, Readable Code | PASS: descriptive functions and two focused JS files | PASS: page rendering separated from quote/storage logic |
| II. Simplicity and Minimal Dependencies | PASS: native platform capabilities only | PASS: no installed packages, build step, or new service |
| III. Meaningful, Proportionate Testing | PASS: built-in runner for behavior, browser walkthrough for UI | PASS: deterministic selection and injected storage failure tests |
| IV. Verify Main User Interactions | PASS: all three user stories have acceptance scenarios | PASS: quickstart covers reloads, empty/single collection, and recovery |
| V. Maintainability and Clear Boundaries | PASS: feature-only scope and stable quote IDs | PASS: data/interaction contracts and setup/evidence instructions |
| Beginner-Friendly Project Constraints | PASS: exact run/check commands planned | PASS: minimal layout, no install step, documented test seams |
| User's technology restrictions | PASS: HTML/CSS/JS and localStorage | PASS: no application backend, database, framework, or external API |

These are design compliance checks, not claims that the application or tests have passed.
Implementation completion requires the recorded checks in [quickstart.md](quickstart.md).
No exceptions or governance amendments are needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-of-day/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── user-interface.md
│   └── favorites-storage.md
└── checklists/
    └── requirements.md
```

`tasks.md` is produced later by `$speckit-tasks`. A `verification.md` evidence record is produced
and populated during implementation, not as a claim of successful verification during planning.

### Source Code (repository root)

```text
index.html                 # title, quote, two controls, and status message
styles.css                 # readable responsive layout and control states
app.js                     # DOM rendering, event handlers, initialization/cleanup
quote-state.js             # five quotes, selection, favorite transitions, storage helpers
package.json               # private package and type: module only; no dependencies
README.md                  # beginner setup, run/check commands, file responsibilities
tests/
└── quote-state.test.js     # Node built-in behavior and persistence tests
```

**Structure Decision**: All app files live at the root. Two JavaScript modules are sufficient:
`quote-state.js` has no DOM or top-level browser access; `app.js` owns DOM interactions. The tiny
package metadata declares ES modules so the same `.js` logic works in browsers and Node. No
package installation or package lockfile is needed.

Implement the following small boundaries, detailed in the design contracts:

- Quote selection accepts the collection, current ID, and a random-number function. Choose from
  a filtered candidate list; do not retry randomly in a loop or keep a seen-history queue.
- Storage helpers accept a function that acquires storage. Acquire inside guarded operations so
  even an exception from the localStorage getter is handled and a later retry can recover.
- Favorite toggling constructs a new selection, saves it, and commits and renders it only on success.
  If storage could not be read initially, retry restoration before calculating any later toggle.
- `initializePage(document, options)` accepts optional quotes, random, and storage provider, and
  returns a `destroy()` operation to remove its listeners. Export the normal initialized page
  instance as `page` for a manual DevTools walkthrough; do not add visible test controls.
- Native buttons, visible text/pressed state, and an inline status region communicate the existing
  interactions. Render quote text as text, not HTML. Keep errors visible until recovery succeeds.

**Visible favorite-state clarification (2026-10-09)**: FR-004 now explicitly requires a persistent
non-color cue that distinguishes saved and unsaved states at rest. Keep the existing "Favorite"
and "Unfavorite" labels as that visible cue, with selected styling and matching `aria-pressed`;
accessibility metadata and color alone are insufficient. FR-006 now explicitly covers automatic
restoration when returning to the same quote, both within a session and after reload. Derive the
appearance from the current quote's ID and restored/saved selections on every render, and change
it only after a successful write. No new component, dependency, or storage format is needed.

Code review shows these mechanisms already exist in `app.js` and `styles.css`; no application
change is authorized in this clarification pass. T024 adds targeted browser verification of the
stronger visible-state criteria using [quickstart.md](quickstart.md). Existing results document
the original baseline; T024 remains pending until the new checks are actually recorded.

## Complexity Tracking

No constitution violations. No complexity exceptions are required.
