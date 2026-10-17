---
trigger: always_on
---

# Testing Standards

Testing is mandatory for production features.

Never assume code is correct because it compiles or appears to work.

## Test levels

Use the appropriate level for each feature:

### Unit tests

Use for:

- domain logic
- validation rules
- calculations
- geometry logic
- constraint evaluation
- utility functions

Unit tests should be fast and deterministic.

### Integration tests

Use for:

- services
- repositories
- database interactions
- API behavior
- authentication
- authorization
- AI integration boundaries

### Component tests

Use for important UI behavior:

- forms
- dialogs
- editors
- validation
- important interactive components

### Browser / E2E tests

Use for critical user journeys such as:

- login
- create project
- create plot
- enter requirements
- generate design
- select layout
- edit design
- save version
- client sharing
- export

## Required test cases

For meaningful features test:

- normal input
- empty input
- invalid input
- minimum values
- maximum values
- boundary values
- duplicate actions
- repeated submissions
- refresh/reload
- browser back/forward where relevant
- network failure
- server failure
- unauthorized access
- forbidden access
- missing resource
- stale data
- malformed data
- mobile/responsive behavior where relevant

## AI-specific testing

AI output must be tested as untrusted and potentially malformed.

Test:

- valid AI response
- incomplete response
- invalid schema
- unexpected enum values
- invalid dimensions
- impossible room relationships
- unknown room IDs
- extra unexpected fields
- empty AI response
- malformed JSON
- contradictory requirements

Invalid AI output must be rejected safely.

## House Design Engine testing

The design engine must have deterministic tests for:

- plot containment
- room overlap
- minimum dimensions
- maximum dimensions where applicable
- connectivity
- door validity
- window validity
- circulation
- staircase constraints
- future expansion constraints

Use fixed test cases so that layout-engine changes can be
compared consistently.

## Regression protection

When a defect is fixed:

1. Reproduce it with a test.
2. Fix the defect.
3. Keep the regression test permanently.

Never remove an existing test simply because it is inconvenient.

## Test quality

Tests must verify behavior, not implementation details,
unless implementation behavior is itself the requirement.

Avoid brittle tests.

Tests should have clear:

- setup
- action
- expected result

## Completion requirement

A feature is not complete until the relevant tests pass.

Before reporting completion, run:

- lint
- type check
- unit tests
- integration tests
- production build
- browser tests where applicable

Report failed tests honestly.

Never hide, skip, disable, or weaken a test just to make the
build pass.
