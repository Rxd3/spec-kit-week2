# Week 2: Spec-Driven Development

I built a Quote of the Day page using Codex and the six Spec Kit stages. The page shows one random quote from five built-in quotes, provides a **New quote** button, and lets me save or remove favorites using browser localStorage. I kept it to plain HTML, CSS, and JavaScript with no frameworks, backend, external APIs, or package dependencies.

This writeup follows the [Week 2 assignment](https://github.com/scottyUX/AI-Augmented-Software-Engineering/blob/main/assignments/02-specs-driven-development/assignment.md). The prompts and outcomes below come from the available Codex conversation history and the actual project artifacts. There is one evidence gap: my recorded refinement changed the specification and verification work, but did not change application code.

## 1. Constitution

My prompt was:

```text
$speckit-constitution Create principles focused on clean, readable code, simplicity, testing, and maintainability. Keep the project beginner-friendly, avoid unnecessary dependencies, and require verification of the main user interactions.
```

This generated [constitution.md](.specify/memory/constitution.md), version 1.0.0. It established five principles: clean and readable code, simplicity and minimal dependencies, meaningful testing, verification of main user interactions, and maintainability. It also required clear setup instructions and actual interaction evidence before declaring a feature complete.

## 2. Specify

My prompt was:

```text
$speckit-specify Build a Quote of the Day page. It should show one randomly selected quote from a small built-in collection. Users can click a "New quote" button to see another random quote and mark quotes as favorites. Favorite selections must remain saved after reloading the page. Keep the functionality limited to these requirements.
```

This generated [spec.md](specs/001-quote-of-day/spec.md) and a [requirements checklist](specs/001-quote-of-day/checklists/requirements.md), which passed all 16 checks. The original specification contained three user stories, 10 functional requirements, five success criteria, and 13 acceptance scenarios. It made decisions such as using five quotes, preventing immediate repeats when another quote is available, allowing favorite removal, and keeping selections independent. It excluded accounts, sharing, a separate favorites list, and a daily scheduler.

## 3. Plan

My prompt was:

```text
$speckit-plan Use plain HTML, CSS, and JavaScript. Do not use React, frameworks, a backend, databases, or external APIs. Store favorite quotes using browser localStorage. Keep the structure simple and easy to test.
```

This generated [plan.md](specs/001-quote-of-day/plan.md), [research.md](specs/001-quote-of-day/research.md), [data-model.md](specs/001-quote-of-day/data-model.md), the [UI contract](specs/001-quote-of-day/contracts/user-interface.md), the [storage contract](specs/001-quote-of-day/contracts/favorites-storage.md), and a [quickstart validation guide](specs/001-quote-of-day/quickstart.md).

The plan separated DOM interactions in `app.js` from quote and storage logic in `quote-state.js`. It chose a JSON array of stable quote IDs under `quote-of-day.favorites`, Node's built-in test runner, and browser walkthroughs. The local Python HTTP server was only a static preview tool; application behavior stayed in the browser. No application code had been generated at this stage.

## 4. Tasks

I invoked the linked skill with no additional instructions. The recorded message was:

```text
[$speckit-tasks](C:\Users\Rasheed\Downloads\DDL\ai-native-week1\spec-kit-week2\\.agents\skills\speckit-tasks\SKILL.md)
```

This generated [tasks.md](specs/001-quote-of-day/tasks.md) with 23 ordered tasks. Five covered initial quote display, four covered browsing, six covered favorites, and eight covered setup and final checks. The tasks included tests and browser verification, with dependencies showing what needed to happen first. Application code was still not created.

## 5. Implement

I invoked the linked skill with no additional instructions:

```text
[$speckit-implement](C:\Users\Rasheed\Downloads\DDL\ai-native-week1\spec-kit-week2\\.agents\skills\speckit-implement\SKILL.md)
```

This produced `index.html`, `styles.css`, `app.js`, `quote-state.js`, minimal `package.json` metadata, `.gitignore`, `README.md`, and `tests/quote-state.test.js`. It also produced the [verification record](specs/001-quote-of-day/verification.md) and screenshots, and marked T001–T023 complete.

The recorded implementation result was **20 automated tests passed and 22 browser checks passed**. Tests covered selection, favorite isolation, persistence, invalid data, and storage failures. Browser checks covered real reloads, browsing, marking and removing favorites, recovery, keyboard interactions, and narrow layouts. The narrow layout was tested in an emulated desktop Chrome viewport, not on a separate mobile device.

## 6. Converge

I invoked the linked skill with no additional instructions:

```text
[$speckit-converge](C:\Users\Rasheed\Downloads\DDL\ai-native-week1\spec-kit-week2\\.agents\skills\speckit-converge\SKILL.md)
```

The actual response was:

> ✅ Converged — the implementation satisfies the spec, plan, and tasks.

The review checked 10 functional requirements, five success criteria, 13 acceptance scenarios, six edge cases, 12 plan decisions, five constitution principles, and all 23 tasks. It found no gaps, reran the 20 automated tests successfully, and reviewed the 22 recorded browser checks. It left `tasks.md` unchanged and added no follow-up implementation tasks. One implementation pass and one convergence pass are recorded.

## My refinement: visible favorite states

After convergence, I used this prompt:

```text
Review the current quote favoriting behavior and its specification. If the spec does not clearly require visible saved/unsaved states, refine the specification to require a clearly distinguishable favorite state, including when the user returns to a previously saved quote. Update the plan and tasks as necessary. Explain exactly which requirement changed and how we can test the difference. Do not modify application code yet.
```

The original specification already required a visible favorite state and restoration for each quote. My refinement made the meaning of that visible state more precise:

| Requirement | Before | After |
|---|---|---|
| FR-004 | A favorite control with a visible selected or unselected state. | Persistent, distinguishable saved and unsaved states, visible without hover or focus, with wording or a symbol/shape cue beyond color. Successful saves update the indication immediately. |
| FR-006 | Showing another quote restores that quote's favorite state without changing selections. | Returning to a quote through New quote or after reload immediately shows its own saved state, before another favorite action. |
| SC-003 | Check multiple favorites and removal across reloads. | Also check the persistent non-color indication on return, without hover, focus, or another favorite action. |

The refinement updated the spec, plan, UI contract, quickstart guide, tasks, and verification record. It added two acceptance scenarios, bringing the total to 15, and added pending verification task **T024**.

To test the difference, I would save quote A, remove hover and focus, visit unsaved quote B, and return to A. A must automatically show its saved indication; the labels must distinguish the states even when I ignore color. I would repeat after reload, remove A and check its unsaved state on return, and check that failed saves retain the last successful indication. Color-only feedback or a temporary confirmation would now explicitly fail the refined criteria.

### Missing implementation-change example

I cannot honestly present this as a refinement that changed the implementation. Before and after the refinement, `app.js` already displayed **Favorite** or **Unfavorite**, set `aria-pressed`, and derived the state from the current quote's saved ID; `styles.css` already styled the selected state. Application and test files were verified unchanged during that refinement, as my prompt requested.

**To fill in before submission:** Add an actual spec/plan refinement that led to an implemented behavior change, with the old requirement and behavior, the revised requirement, the resulting code/output change, and verification evidence. No such completed example is present in the available history. The refinement above documents a real change to requirements and verification work, but does not establish the implementation-change example requested for this writeup.

The convergence result applies to the original baseline. T024 remains unchecked, and there is no recorded convergence pass after the refinement. I have not treated the earlier passing checks as proof that the new targeted walkthrough was executed.

## What I learned

For a page this small, creating a constitution, research notes, contracts, and a task list felt like more overhead than writing the basic controls. The process was useful when it turned vague ideas such as “another quote” and “favorites persist” into rules I could actually test. Reviewing favorite states helped me see that saving data and clearly showing its state are separate requirements. I also learned to keep a reported convergence result tied to the requirements checked at that time, and to distinguish a documentation clarification from a verified implementation change.
