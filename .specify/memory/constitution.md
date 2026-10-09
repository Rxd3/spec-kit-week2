<!--
Sync Impact Report (temporary review material; remove before committing)
Version change: unversioned scaffold -> 1.0.0 (initial adoption)
Modified principles:
- PRINCIPLE_1_NAME (unfilled) -> I. Clean, Readable Code
- PRINCIPLE_2_NAME (unfilled) -> II. Simplicity and Minimal Dependencies
- PRINCIPLE_3_NAME (unfilled) -> III. Meaningful, Proportionate Testing
- PRINCIPLE_4_NAME (unfilled) -> IV. Verify Main User Interactions
- PRINCIPLE_5_NAME (unfilled) -> V. Maintainability and Clear Boundaries
Added sections: Beginner-Friendly Project Constraints; Development Workflow and Quality Gates
Removed sections: None
Follow-up TODOs: None
Scope: Constitution only; dependent templates and commands read it at runtime.
-->
# Spec Kit Week 2 Constitution

## Core Principles

### I. Clean, Readable Code

Code MUST use descriptive names, consistent formatting, and explicit control flow. Functions and
modules MUST have a clear responsibility; unrelated work MUST be separated. Comments MUST explain
non-obvious decisions or constraints rather than restate the code. Clever shortcuts, unexplained
constants, and compressed expressions MUST be replaced when they obscure behavior. A beginner
reading a changed function MUST be able to identify its purpose, inputs, outputs, and failure paths
from the code and accompanying documentation.

### II. Simplicity and Minimal Dependencies

Implementations MUST use the simplest approach that satisfies current requirements. Speculative
features, premature optimization, and abstractions without a demonstrated need MUST NOT be added.
Built-in capabilities and existing project tools MUST be considered before adding a dependency.
Every new dependency MUST have a documented purpose, an explanation of why existing options are
insufficient, and an assessment of its setup and maintenance cost. Dependencies introduced for
convenience alone MUST NOT be added when a small, readable solution already meets the need.

### III. Meaningful, Proportionate Testing

Tests MUST verify observable behavior and requirements rather than reproduce implementation details.
New or changed business logic MUST have focused automated tests for its expected behavior and
relevant boundary or failure cases. Bug fixes MUST include a regression test when the failure can
be reproduced in the existing test setup; otherwise, the reproduction and verification steps MUST
be documented. Documentation-only and cosmetic changes MAY use direct inspection instead of new
automated tests. Test tooling MUST remain proportionate to project complexity, and relevant existing
checks MUST pass before a change is marked complete.

### IV. Verify Main User Interactions

Each feature specification MUST identify its main user interactions and expected outcomes. Initial
delivery MUST exercise every main interaction in the running application. Later changes MUST
exercise affected main interactions and connected flows that could regress. Verification MUST
cover the successful path and applicable invalid input, empty, error, and recovery states.
Automated interaction tests or documented manual walkthroughs MAY provide this evidence. Records
MUST include the application setup, actions or commands, expected outcomes, and observed results.
A feature MUST NOT be marked complete while required verification is missing or a main interaction
is failing. This gate ensures that passing isolated tests also corresponds to a usable application.

### V. Maintainability and Clear Boundaries

Changes MUST remain focused on the stated requirement, with unrelated refactoring deferred. Shared
behavior MUST have one clear source of truth when duplication would make fixes inconsistent;
abstractions MUST retain understandable interfaces. Errors MUST be handled explicitly and provide
actionable messages where users need to recover. Obsolete code and dependencies made unnecessary
by a change MUST be removed. Documentation MUST be updated when setup, commands, configuration,
or user-visible behavior changes so that future contributors can run, understand, and modify the
project without relying on undocumented knowledge.

## Beginner-Friendly Project Constraints

- Setup and development instructions MUST list prerequisites and exact commands for running the
  application and its checks from a fresh checkout.
- The project MUST use a consistent directory structure and naming conventions. Non-obvious
  architectural choices MUST include a short explanation of their purpose.
- Examples and instructions MUST define unfamiliar project-specific terms when first introduced.
- Configuration MUST expose only necessary options, with documented defaults. Required local
  configuration MUST include an example that contains no secrets.
- New tools, frameworks, or services MUST satisfy the dependency justification in Principle II
  and MUST include any additional setup steps in the project documentation.

## Development Workflow and Quality Gates

1. Define the smallest useful change, its acceptance criteria, and its main user interactions
   before implementation. Plans MUST check compliance with all five principles.
2. Implement focused changes using existing conventions. Record dependency or complexity decisions
   in the feature plan or change description when they require justification.
3. Run relevant automated checks and verify main user interactions under Principle IV. Record
   results and resolve failures before marking the work complete.
4. Review the change for readability, unnecessary complexity, maintenance impact, and documentation
   accuracy. A solo contributor MAY perform this review using the same gates.
5. Completion reports MUST state what changed, which checks and interactions were verified, their
   results, and any remaining limitations. Unexecuted checks MUST NOT be reported as passing.

## Governance

This constitution governs project specifications, plans, implementation, and reviews. Every change
MUST be checked against its principles and quality gates before completion. Conflicts in project
guidance MUST be resolved in favor of this constitution or through an explicit amendment.

Amendments MUST document the proposed rule, its rationale, the effect on existing work, and any
required migration. The project maintainer MUST approve the amendment before it is adopted.
Approved amendments MUST update this file, its version, and its last-amended date while preserving
the original ratification date. Temporary Sync Impact Reports MUST be removed before committing.

Versions MUST follow semantic versioning: MAJOR for incompatible removals or redefinitions of
principles or governance, MINOR for new principles or materially expanded guidance, and PATCH for
clarifications that do not change obligations. Deviations MUST be documented with their rationale,
scope, and a follow-up resolution in the feature plan or change description, and MUST receive
maintainer approval before completion. Missing required interaction verification MUST block
completion until the evidence is provided or the governing rule is explicitly amended.

**Version**: 1.0.0 | **Ratified**: 2026-10-09 | **Last Amended**: 2026-10-09
