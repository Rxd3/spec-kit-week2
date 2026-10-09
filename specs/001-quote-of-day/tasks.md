---
description: "Implementation tasks for the Quote of the Day feature"
---

# Tasks: Quote of the Day

**Input**: Design documents from `specs/001-quote-of-day/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [UI contract](contracts/user-interface.md),
[storage contract](contracts/favorites-storage.md), and [quickstart.md](quickstart.md).

**Tests**: Include focused automated tests as required by Constitution III and the approved plan,
and recorded running-page verification as required by FR-010 and Constitution IV. Use only
Node's built-in `node:test` and `node:assert/strict`; no test packages or DOM simulation library.
Write story tests first and confirm they fail for the missing behavior before implementation.

**Organization**: Three user stories in priority order, each with an independent verification
checkpoint. All three are required for delivery. This document creates no application source files.

## Format: `[ID] [P?] [Story] Description`

- Tasks have an unchecked checkbox, sequential ID, optional `[P]`, and story label in story phases.
- `[P]` means separate files can be authored independently after stated prerequisites are satisfied.
- Parallel implementation pairs use the agreed function contracts; integration waits for both.
- Setup, foundational, and final tasks have no story label.

## Path Conventions

- `index.html`, `styles.css`, `app.js`, `quote-state.js`, `package.json`, and `README.md` are at
  the repository root. There is no `src/`, backend, build output, or dependency installation.
- Automated checks live in `tests/quote-state.test.js`.
- Actual verification evidence is recorded in `specs/001-quote-of-day/verification.md` during
  implementation, with setup, actions, expected outcomes, observed results, and pass/fail.
- Preserve the existing specification, plan, contracts, and quality-checklist review markers.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish native module metadata and beginner run/check instructions.

- [X] T001 [P] Create `package.json` with `private: true` and `type: module` so browsers and Node tests share JavaScript modules; add no dependencies, package lockfile, build tool, or install step.
- [X] T002 [P] Create `README.md` with prerequisites, the planned file responsibilities, `node --test`, `python -m http.server 8000 --bind 127.0.0.1`, and the fixed preview URL `http://127.0.0.1:8000/`; explain that static serving is development tooling and favorites depend on the same browser origin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the actual page surface and styling before story integration.

**Blocking gate**: Complete Phase 1 before this phase; complete both tasks before user-story work.

- [X] T003 [P] Create `index.html` with the "Quote of the Day" heading, one `#quote-text` region, native `#new-quote` and `#favorite-toggle` buttons, `aria-pressed="false"`, and an inline `#status-message` region using the UI contract; link `styles.css`, keep unimplemented controls disabled, and reserve module startup for T008.
- [X] T004 [P] Create `styles.css` for a readable single-page layout with wrapping quote text, visible keyboard focus, and clear pressed/disabled button states; allow narrow screens without hiding controls and use no remote fonts or other external assets.

**Checkpoint**: The two agreed DOM controls and message/quote regions exist. No feature behavior
is claimed complete yet. T003 and T004 can use the UI contract independently.

---

## Phase 3: User Story 1 - Read a Random Quote (Priority: P1)

**Goal**: Opening the page displays one of five built-in quotes with no setup or sign-in.

**Independent Test**: With the feature's saved key absent, open/reload the running page five times.
Each load shows the correct heading, exactly one complete built-in quote, and an unselected favorite
state. Use controlled empty/one-quote initialization to verify fallback rendering.

### Tests for User Story 1

- [X] T005 [US1] Add collection validation and initial-selection tests in `tests/quote-state.test.js` using `node:test` and `node:assert/strict`; cover exactly five distinct quotes, IDs `quote-1` through `quote-5`, malformed/duplicate records, eligibility of every quote with injected random samples, samples zero and just below one, and empty/one-quote inputs; run `node --test` and confirm the missing behavior fails.

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement exported `QUOTES`, `getUsableQuotes`, and initial `selectQuote` behavior in `quote-state.js`; enforce ID type String with "Stable, unique, nonempty identity such as `quote-1`" and text type String with "Nonempty after trimming; plain text", five distinct normal quotes, and first usable occurrence for duplicate IDs/text; return null for no usable quote and keep all browser-global access out of this module.
- [X] T007 [P] [US1] Implement `initializePage(document, options)` and exported normal instance `page` in `app.js` against the agreed logic interfaces; accept optional quotes/random/getStorage, enforce `currentQuote` as "Exactly one displayed quote; null only for an empty usable collection", render quote text using text content, show the unselected favorite state, disable both controls with "No quotes are available." for an empty collection, and return `destroy()` for listener cleanup without visible test controls.
- [X] T008 [US1] Connect the module startup in `index.html` to `app.js` after T006 and T007 are complete; verify normal module loading and one initial render, leaving "New quote" and favorite actions disabled until their stories are implemented.
- [X] T009 [US1] Run `node --test` and the initial-display, invalid-record, empty-collection, and single-quote initialization walkthroughs from `specs/001-quote-of-day/quickstart.md`; record actual setup, five normal loads, outcomes, and results in `specs/001-quote-of-day/verification.md` for FR-001/002 and SC-001, with later-story checks explicitly pending.

**Checkpoint**: US1 is a demonstrable first increment. It is not the complete requested feature.
T007 authors the page controller independently of T006 using the fixed contracts; T008 joins them.

---

## Phase 4: User Story 2 - Request Another Quote (Priority: P2)

**Goal**: "New quote" selects a different eligible quote without reloading the page.

**Independent Test**: From a displayed quote, activate "New quote" 20 times and record the texts.
Each result differs from the preceding quote, exactly one quote remains visible, and the page does
not navigate. Earlier quotes may return; a one-quote collection remains displayable.

### Tests for User Story 2

- [X] T010 [US2] Extend `tests/quote-state.test.js` with deterministic tests for each current ID excluding itself when alternatives exist, all remaining candidates being eligible, earlier quotes being eligible again, and empty/one-quote fallbacks under repeated selections; confirm the missing no-repeat behavior fails before implementation.

### Implementation for User Story 2

- [X] T011 [P] [US2] Extend `selectQuote` in `quote-state.js` to filter out the current ID when alternatives exist and choose from the candidates with one injected random sample; avoid retry loops and seen-history queues, and return the same quote when only one is usable.
- [X] T012 [P] [US2] Add the "New quote" handler in `app.js`, enable `#new-quote` for usable collections, render only the newly selected quote without navigation or extra quote regions, preserve other page state and status messages, and remove its listener in `destroy()`.
- [X] T013 [US2] After T011/T012, run `node --test` and the 20-action, rapid-action, empty/single-quote browsing walkthroughs in `specs/001-quote-of-day/quickstart.md`; record results in `specs/001-quote-of-day/verification.md` for FR-003/008 and SC-002, and reserve saved-favorite preservation verification for T018 after US3 exists.

**Checkpoint**: Initial viewing and random browsing work together. Favorites are still pending.

---

## Phase 5: User Story 3 - Keep Favorite Selections (Priority: P3)

**Goal**: Mark/unmark the current quote and retain independent selections after real reloads,
including clear error messages and retry without losing previously saved favorites.

**Independent Test**: Mark three distinct quotes, reload five times, and revisit them to check their
states. Unmark one, reload another five times, and confirm that only its selection was removed.
Verify save/restore failures and a successful retry in the actual running page.

### Tests for User Story 3

- [X] T014 [US3] Extend `tests/quote-state.test.js` with tests that `toggleFavorite` returns a new Set, toggles only a known current quote ID, retains other IDs, and never duplicates a selection; confirm missing toggle behavior fails before implementation.
- [X] T015 [US3] Add storage contract tests in `tests/quote-state.test.js` with injected providers/readers/writers: missing key, empty array, multiple IDs and removals across restoration, duplicates/unknown/non-string entries, malformed JSON/non-array values, no startup writes, getter/read/write exceptions, old value retained on failed writes, sorted serialization, and successful later retry; confirm missing storage behavior fails before implementation.

### Implementation for User Story 3

- [X] T016 [P] [US3] Implement `toggleFavorite`, `loadFavorites`, and `saveFavorites` in `quote-state.js` using the data-model result shapes and key `quote-of-day.favorites`; return a new Set for toggles, acquire storage inside guarded operations, persist only lexicographically sorted known ID strings, filter invalid/duplicate entries, distinguish invalid readable data from access failure with `needsRestore`, leave stored data untouched on load, and return save success only after `setItem` completes.
- [X] T017 [P] [US3] Integrate favorites in `app.js`: enforce Set-valued `favorites` as "Last successfully restored or saved usable selections", Boolean `needsRestore` as "Initial storage access/read failed; restoration must be retried before saving", and null/error-coded `error` as "Restore failure, invalid data, or save failure mapped to a plain-language status"; use browser localStorage through the default provider, restore on startup, render each current quote's own "Favorite"/"Unfavorite" and `aria-pressed` state, enable the toggle only with a current quote, retry restoration before toggling after a read failure, save a candidate before committing it, preserve prior selections after failed writes, and show/clear the exact UI-contract messages on failure/success; browsing must never write favorites or dismiss errors, and `destroy()` must remove both listeners.
- [X] T018 [US3] After T016/T017, run `node --test` and normal persistence walkthroughs from `specs/001-quote-of-day/quickstart.md`; record in `specs/001-quote-of-day/verification.md` one-action marking/removal, three favorites over five real reloads, one removal over another five reloads, revisited quote states, and 20 browsing actions with unchanged stored favorites for FR-004/005/006 and SC-003.
- [X] T019 [US3] Execute the controlled browser walkthroughs in `specs/001-quote-of-day/quickstart.md` for unreadable/mixed saved data, provider and read exceptions, failed add/removal, quota-style write failure, and successful retry; record messages, unchanged prior selections, continued browsing, recovery without losing other favorites, and reload persistence in `specs/001-quote-of-day/verification.md` for FR-007/008 and SC-005.

**Checkpoint**: All requested functionality exists and has recorded story-level evidence. US3's
basic favorite flow needs US1's displayed quote but not US2's browsing handler; revisit a selected
quote with controlled initialization if verifying US3 alone. Combined browsing is covered by T018.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish beginner documentation, review scope/readability, and confirm delivery gates.

- [X] T020 [P] Finalize `README.md` with the actual file responsibilities, exact fresh-checkout run/test commands, no-install requirement, same-origin/localStorage limitations, and links to `specs/001-quote-of-day/quickstart.md` and `specs/001-quote-of-day/verification.md`; document only implemented interactions.
- [X] T021 [P] Inspect `index.html` and `styles.css` in the running page using keyboard controls and a narrow viewport, including long quote text and visible focus/pressed/disabled/status states; fix any observed usability defect and record observed results in `specs/001-quote-of-day/verification.md` without adding product features.
- [X] T022 Review `app.js`, `quote-state.js`, `index.html`, `styles.css`, and `package.json` for clear names, focused responsibilities, explicit errors, obsolete code, and compliance with FR-009 and the constitution; remove unnecessary complexity and confirm there are no frameworks, dependencies, backend, database, external API calls, remote assets, or extra functionality.
- [X] T023 Run the final `node --test`, reconcile all acceptance scenarios and SC-001 through SC-005 against `specs/001-quote-of-day/quickstart.md`, and finish `specs/001-quote-of-day/verification.md`; rerun affected browser checks after any T021/T022 fixes, preserve pending/failed status for unverified work, and mark delivery complete only when all required checks pass with actual evidence.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Setup T001-T002
    -> Foundation T003-T004
    -> US1 T005 -> (T006 + T007) -> T008 -> T009
    -> US2 T010 -> (T011 + T012) -> T013
    -> US3 T014 -> T015 -> (T016 + T017) -> T018 -> T019
    -> Polish (T020 + T021) -> T022 -> T023
```

A plus sign indicates safe parallel authoring of different files against the approved contracts.
The arrow indicates a dependency. Run/checkpoint integration after both parallel tasks are complete.
All tasks in a phase must finish before advancing under the default sequential strategy.

### User Story Dependencies

- US1 needs only Setup/Foundation.
- US2 needs US1's collection and displayed-page controller. Its verification is independent of
  favorites until the combined preservation check in T018.
- US3 needs US1's display/initialization contract; basic marking and reload persistence do not
  logically require US2. The recommended execution order remains US1 -> US2 -> US3 because both
  later stories extend `app.js`, `quote-state.js`, and the same test/evidence files.
- Full delivery requires all three stories and the final gate, not merely the first increment.

### Within Each User Story

1. Write tests for the new observable behavior and confirm an expected missing-behavior failure.
2. Implement the logic and controller against the documented function/DOM contracts.
3. Integrate, run relevant checks, exercise the running page, and record actual evidence.
4. Resolve failures before completing the story checkpoint.

### Parallel Opportunities

- T001 with T002: independent package metadata and documentation.
- T003 with T004: markup and styles based on fixed DOM identifiers.
- T006 with T007, after T005: logic and initial page controller; integration waits at T008.
- T011 with T012, after T010: selection logic and browsing handler; integration waits at T013.
- T016 with T017, after T014/T015: persistence helpers and favorite controller; verification waits
  at T018. Neither parallel task writes the shared test or verification file.
- T020 with T021: final README and UI review/evidence, after all story checkpoints.
- All tasks that modify `tests/quote-state.test.js` or `verification.md` must serialize with other
  writers to that file. Do not run the later stories concurrently without changing the file layout.

---

## Parallel Example: User Story 1

After T005's expected failing tests, author T006 in `quote-state.js` and T007 in `app.js` together
using the agreed initialization/selection interfaces. Wait for both before module startup in T008
and running-page verification in T009.

## Parallel Example: User Story 2

After T010, author T011's current-quote exclusion in `quote-state.js` alongside T012's button
handler in `app.js`. Verify the joined behavior and rapid actions only after both are complete.

## Parallel Example: User Story 3

After T014/T015, author T016's guarded storage helpers in `quote-state.js` alongside T017's
save-before-commit controller in `app.js`. Use the documented result shapes rather than introducing
new layers. Wait for both before persistence and failure/recovery walkthroughs.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup/Foundation, then US1.
2. Validate the initial-display increment with its tests and five-load walkthrough.
3. Treat it as an intermediate demonstration; disabled future controls are temporary and all
   requested stories remain required before final delivery. No publishing/deployment task is implied.

### Incremental Delivery

1. Add initial quote viewing and pass T009.
2. Add random browsing and pass T013, retaining the earlier behavior.
3. Add persistent favorite selections and pass T018/T019, including combined browsing preservation.
4. Finish documentation and the final evidence review. Keep only the specified interactions.

### Parallel Team Strategy

Use only the explicitly marked pairs once their tests/contracts are ready. The deliberately small
file structure limits parallelism; prefer finishing each story before another edits the same files.
A solo contributor can execute tasks in ID order without changing the strategy.

---

## Notes

- All checkboxes are initially unchecked. Tasks are implementation work, not claims of completion.
- Quote ID/text constraints are quoted in T006 to preserve the data model's exact requirements.
- Do not install packages or add a backend just to serve files locally or test the feature.
- Storage tests must cover failures from the provider itself, not only `setItem` failures.
- A failed initial read must be retried before a favorite write to avoid losing unseen saved IDs.
- Do not mark FR-010 complete from unit tests alone; actual browser verification is mandatory.
- Scope stays at one page, five built-in quotes, "New quote", and reversible saved favorites.

## Phase 7: User Story 3 - Visible Favorite State Verification

**Origin**: 2026-10-09 clarification of FR-004, FR-006, US3 acceptance scenarios 8–9, and SC-003.
Original T001–T023 remain completed baseline work. The current code already has distinct labels,
selected styling, and per-quote rendering; this phase verifies the newly explicit criteria rather
than assuming code changes are needed. It depends on T023 and changes verification evidence only.

- [ ] T024 [US3] Execute the targeted visible-state walkthrough in `specs/001-quote-of-day/quickstart.md` against the existing running page: compare saved/unsaved states with hover/focus removed and colors disregarded, verify automatic A/B/A and post-reload restoration before any favorite action, verify unsaved restoration after removal, and confirm failed writes retain the prior indication; check desktop/narrow layouts and record actual observations plus saved/unsaved captures in `specs/001-quote-of-day/verification.md` for FR-004/FR-006 and SC-003. Do not modify application or test code; if a check fails, record the failure and the specific follow-up needed.

**Checkpoint**: T024 is pending until the clarified visible-state criteria have actual evidence.
No additional functionality, storage schema, dependencies, or application change is authorized
by this specification clarification.
