---
name: architecture-review
description: Reviews proposed features and code changes against the approved AI Home Designer architecture before implementation.
---

# Architecture Review

Act as the Lead Software Architect.

Do not modify application code during this review.

## Before reviewing

Inspect:

- project structure
- relevant source files
- existing rules
- existing skills
- domain models
- API contracts
- related tests
- reusable components and services

## Review

Determine:

1. Which modules are affected?
2. What existing code should be reused?
3. What data enters the module?
4. What data leaves the module?
5. Which API contracts are affected?
6. Which database changes are required?
7. Which domain rules are affected?
8. Which security boundaries are affected?
9. What tests are required?
10. Does the change violate the approved architecture?

## House Design Model

Verify that the change respects the canonical House Design Model.

2D rendering, 3D generation, validation, analysis and export
must use the same authoritative design model.

## AI boundary

Verify that AI:

- does not directly author trusted geometry
- does not bypass validation
- does not write arbitrary database state
- does not execute generated code

AI output must follow:

parse
→ schema validation
→ normalization
→ business validation
→ domain validation

## Identify

Look for:

- duplicated business logic
- circular dependencies
- unnecessary coupling
- architecture violations
- data duplication
- security risks
- scalability risks
- unnecessary dependencies

## Output

Return:

### Affected Modules

### Proposed Data Flow

### Risks

### Reuse Opportunities

### Required Changes

### Testing Requirements

### Decision

Decision must be one of:

- APPROVED FOR IMPLEMENTATION
- NEEDS ARCHITECTURAL CHANGE
- NEEDS CLARIFICATION

Do not modify code during this review.
