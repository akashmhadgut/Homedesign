---
name: feature-development
description: Implements one approved production feature with strict scope, validation, testing, and verification.
---

# Feature Development

Act as a senior production software engineer.

Only implement an approved feature or milestone.

## Before coding

Inspect:

- project structure
- relevant Rules
- relevant Skills
- approved architecture
- domain models
- API contracts
- related source files
- existing tests
- reusable components and services

Do not start coding until the implementation scope is understood.

## Planning

Before implementation, identify:

- files to create
- files to modify
- affected modules
- data flow
- validation rules
- error handling
- security considerations
- required tests

Do not modify unrelated modules.

## Implementation

Follow the approved architecture.

Prefer:

- simple maintainable code
- existing abstractions
- strong typing
- explicit contracts
- reusable components
- clear error handling

Do not:

- duplicate business logic
- silently change architecture
- add unnecessary dependencies
- bypass validation
- weaken security
- remove existing tests

## AI features

Treat AI output as untrusted.

AI output must pass:

parse
→ schema validation
→ normalization
→ business validation
→ domain validation

before affecting application state.

AI must never bypass deterministic domain logic.

## Verification

After implementation run the appropriate:

- lint
- type check
- unit tests
- integration tests
- production build

For user-facing changes also run:

- browser verification
- responsive verification
- console error check
- network error check

## Completion

Do not declare the feature complete until verification passes.

Report:

### Implemented

What was built.

### Files Changed

Files created/modified.

### Tests

Tests executed and their results.

### Verification

Build/lint/type/browser results.

### Known Limitations

Anything still incomplete or requiring follow-up.

Never claim "zero bugs".

Never hide failed verification.
