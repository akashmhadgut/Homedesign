# Testing Strategy Document

## 1. Purpose

This document defines the professional testing strategy for the AI Home Designer.

The strategy protects the most important product invariant:

> No invalid, unauthorized, unvalidated, or semantically corrupted state may become authoritative House Design state.

Testing covers:

- frontend behavior
- backend behavior
- API contracts
- domain rules
- geometry and topology
- deterministic layout generation
- AI output validation
- persistence and versioning
- tenant isolation and authorization
- 2D editing
- 3D derivation
- walkthrough behavior
- client review sharing
- exports
- accessibility
- performance
- security
- deployment readiness

The strategy favors deterministic, fast tests close to the affected boundary, with browser E2E tests reserved for critical user journeys.

---

## 2. Testing Principles

### 2.1 Test the architecture boundaries

Tests must verify that responsibilities remain separated.

Examples:

- React does not own domain rules.
- Express controllers do not contain business logic.
- AI providers do not directly modify HouseDesign.
- Prisma repositories do not decide authorization.
- 3D rendering does not become an independent source of truth.
- Client share links cannot access unrelated projects.

### 2.2 Determinism first

All deterministic domain and design-engine tests must be reproducible.

A failing geometry test must be rerunnable with the same:

- fixture
- engine version
- configuration
- seed
- input model

### 2.3 Invalid state must be tested explicitly

The test suite must emphasize rejection paths, not only successful paths.

Every important invariant should have at least one test proving that invalid state is rejected.

### 2.4 Security tests are part of functional correctness

Authorization failures, cross-tenant access, invalid share tokens, unsafe files, and malformed AI output are functional defects, not optional hardening.

### 2.5 Prefer observable outcomes

Tests should assert externally meaningful results such as:

- accepted/rejected command
- persisted version
- returned API contract
- generated geometry
- validation issues
- rendered interaction
- authorization result

Avoid tests that depend unnecessarily on private implementation details.

---

## 3. Test Pyramid

The project uses the following approximate distribution:

```text
                    E2E / Browser
                   /             \
                Integration / API
              /                   \
       Domain / Engine / Component
     /                               \
             Unit / Utility
```

### 3.1 Unit tests

Fast tests for small deterministic units:

- geometry utilities
- coordinate conversion
- tolerance functions
- constraint predicates
- normalization
- DTO mapping
- token parsing
- domain value objects
- scoring/evaluation functions

### 3.2 Domain and engine tests

Highest-priority test category for the product.

Covers:

- HouseDesign invariants
- topology
- room boundaries
- wall intersections
- openings
- staircase constraints
- circulation
- buildable-area checks
- hard constraints
- soft preferences
- concept diversity
- deterministic generation

### 3.3 Integration tests

Verify multiple application layers together:

- service + repository
- API + database
- version creation + persistence
- authorization + repository scope
- AI pipeline + validators

### 3.4 Component tests

React Testing Library tests for meaningful UI behavior:

- forms
- requirement editing
- design preference controls
- editor commands
- validation feedback
- version controls
- client-review actions

### 3.5 E2E tests

Playwright covers only important cross-system journeys and high-risk browser behavior.

---

## 4. Test Technology

### Required

- Vitest
- React Testing Library
- Playwright
- TypeScript strict mode

### Supporting tooling

The project may use the repository's normal linting, formatting, type-checking, and build tools inside CI.

Avoid adding a new testing framework when an existing tool can perform the required test.

Visual-regression tooling should be introduced only for stable, high-value views where screenshot comparison provides clear value.

---

## 5. Test Repository Structure

Recommended structure:

```text
tests/
  fixtures/
    plots/
    requirements/
    designs/
    ai/
    users/
  factories/
  helpers/
  e2e/
  contract/

packages/
  domain/
    src/**/*.test.ts
  design-engine/
    src/**/*.test.ts

apps/
  api/
    src/**/*.test.ts
  web/
    src/**/*.test.ts
```

Test fixtures must be version-controlled, intentionally small, deterministic, and free of real customer data.

---

## 6. Canonical Test Fixtures

The project must maintain a small official fixture set.

### 6.1 Plot fixtures

Include at minimum:

- small rectangular plot
- medium rectangular plot
- narrow/deep plot
- plot with restrictive setbacks
- invalid self-intersecting boundary
- plot with road/access metadata

### 6.2 Requirement fixtures

Include:

- minimal one-floor house
- typical family house
- multi-floor house
- parking-required house
- staircase-required house
- future-expansion house
- intentionally impossible requirement set
- ambiguous requirement set requiring clarification

### 6.3 Design fixtures

Include:

- valid single-room model
- valid multi-room model
- adjacent-room topology
- T-junction wall topology
- opening-bearing wall
- staircase model
- invalid overlapping rooms
- invalid wall intersection
- invalid opening placement

### 6.4 AI fixtures

Include:

- valid structured DesignIntent
- malformed JSON
- missing required field
- wrong enum value
- wrong numeric range
- duplicated semantic requirements
- malicious prompt-injection-like content
- oversized output
- provider timeout/error

---

## 7. Domain Model Testing

### 7.1 Entity invariants

Test every canonical entity for:

- required fields
- identifier format
- immutable identifiers where required
- valid units
- valid ranges
- valid references
- legal lifecycle transitions

### 7.2 Aggregate boundaries

Tests must prove that commands operate only inside their allowed aggregate boundary.

Examples:

- a room command cannot update another project's room
- a design version cannot belong to another project
- a review cannot reference a version outside its project

### 7.3 Domain command tests

For every supported domain command test:

1. valid input succeeds
2. invalid input is rejected
3. no partial mutation occurs after rejection
4. returned state is structurally valid
5. relevant derived data is updated consistently

### 7.4 Restore tests

Restoring a saved DesignVersion must:

- reproduce the saved canonical state
- create the expected new draft revision
- preserve historical version immutability
- reject stale concurrent updates where applicable

---

## 8. Geometry and Topology Testing

Geometry is a critical correctness boundary and receives unusually strong test coverage.

### 8.1 Primitive geometry

Test:

- point equality with tolerance
- distance
- line intersection
- segment intersection
- polygon area
- containment
- overlap
- bounding box
- snapping
- offset/setback calculation

### 8.2 Topology

Test:

- room boundary closure
- wall connectivity
- T-junctions
- cross-junctions where supported
- invalid dangling boundaries
- duplicate wall segments
- zero-length walls
- invalid cycles

### 8.3 Numerical tolerance

Tests must verify behavior immediately below, at, and above configured tolerances.

The expected tolerance must be centralized rather than copied through individual modules.

### 8.4 Property-style invariants

Even without adding a property-testing dependency initially, the test suite should exercise generated or parameterized geometry cases for invariants such as:

- a validated room boundary is closed
- valid room area is positive
- a validated hard-constraint design remains inside the buildable area
- moving a wall cannot silently create an out-of-bounds room
- an accepted opening remains attached to its host wall

A property-testing library may be introduced later if the value justifies the dependency.

---

## 9. Design Engine Testing

The design engine is the most important deterministic subsystem.

### 9.1 Deterministic output

For fixed:

- DesignIntent
- Plot/Site
- engine version
- configuration
- seed

assert that the same generation request produces the same canonical concept set or the same defined deterministic result representation.

If implementation changes intentionally, update the engine version and corresponding golden fixtures rather than silently accepting changed behavior.

### 9.2 Feasibility tests

Before generation, test:

- feasible input accepted
- impossible area requirement rejected
- impossible setback requirement rejected
- impossible room combination rejected
- impossible staircase requirement rejected
- impossible parking requirement rejected

### 9.3 Hard-constraint tests

Every hard constraint type must have positive and negative cases.

Examples:

```text
inside buildable area
outside buildable area
minimum room area satisfied
minimum room area violated
required adjacency satisfied
required adjacency violated
required circulation satisfied
required circulation violated
```

No candidate with a hard-constraint violation may be returned as a valid concept.

### 9.4 Soft-preference tests

Test that soft preferences:

- influence evaluation
- produce explicit warnings when unsatisfied
- never invalidate geometry by themselves
- do not silently override hard constraints

Vastu must be tested as a preference/warning mechanism, not as structural truth.

### 9.5 Concept count tests

Test:

- five distinct concepts when five feasible concepts exist
- fewer concepts when fewer genuinely distinct valid concepts exist
- zero concepts when no feasible concept exists
- structured explanation when fewer than the requested target are produced

### 9.6 Diversity tests

Verify duplicate and near-duplicate concepts are filtered according to the documented diversity rules.

Two concepts that differ only in irrelevant IDs or ordering must not be counted as meaningfully distinct.

### 9.7 Seed tests

Same seed → same result.

Different accepted seeds may produce different concepts, but tests must not require every different seed to produce a different result.

---

## 10. AI Pipeline Testing

AI behavior is nondeterministic and must therefore be tested at the boundary rather than by asserting model prose.

### 10.1 Provider contract tests

The `IAIProvider` contract must have tests for:

- valid response
- malformed provider response
- timeout
- provider error
- rate limit
- empty response
- oversized response

### 10.2 Structured output validation

Test that malformed or unsafe AI output is rejected before domain use.

Test categories:

- missing fields
- unknown fields where disallowed
- invalid enums
- invalid numeric ranges
- contradictory requirements
- malformed arrays
- oversized values
- prompt-injection-like text embedded in fields

### 10.3 Normalization

Test deterministic normalization separately from provider calls.

Normalization must not silently alter the meaning of explicit requirements.

### 10.4 Business and domain validation

AI-derived DesignIntent must pass all validation layers before entering the design engine.

Tests must prove that bypassing a layer is impossible through the normal application interfaces.

### 10.5 Provider independence

Core domain and engine tests must never require a live Gemini API call.

Live provider tests belong in a separate optional/integration suite and must not be required for local unit testing.

---

## 11. API Testing

### 11.1 Contract tests

Every documented API endpoint must have tests covering:

- successful response schema
- validation failure
- authorization failure
- not-found behavior
- conflict behavior where applicable
- pagination where applicable
- idempotency where applicable

### 11.2 DTO validation

Test boundary schemas with:

- minimum valid values
- maximum valid values
- invalid types
- omitted required values
- unexpected values
- oversized strings/arrays

### 11.3 Error contract

Every expected error category must return the documented structure.

Internal stack traces, SQL details, provider credentials, and sensitive infrastructure information must never appear in production API responses.

### 11.4 Idempotency

For endpoints documented as idempotent:

- repeated identical request → same logical result
- duplicate request does not create duplicate state
- conflict behavior is deterministic

---

## 12. Persistence Testing

Database integration tests use an isolated test database/schema.

Test:

- migrations
- foreign-key relationships
- unique constraints
- transaction boundaries
- version snapshots
- draft revisions
- tenant-scoped queries
- optimistic concurrency
- rollback after failure

Tests must prove that historical DesignVersion records cannot be modified by normal application operations.

---

## 13. Authorization and Multi-Tenancy Testing

This area is mandatory for every resource family.

### 13.1 Matrix testing

For each protected resource test at least:

```text
same tenant + allowed role
same tenant + disallowed role
other tenant + otherwise valid ID
unauthenticated user
expired authentication
revoked authentication
```

### 13.2 IDOR/BOLA tests

Attempt to access another tenant's:

- workspace
- project
- plot
- requirements
- design
- version
- files
- client review

All unauthorized attempts must fail without revealing whether the target resource exists where the API contract requires resource indistinguishability.

### 13.3 Repository scope tests

Test that repository methods cannot accidentally omit tenant/project predicates.

Authorization must not depend solely on frontend filtering.

---

## 14. Client Review and Share-Link Testing

Test:

- token creation
- cryptographic randomness requirements
- correct scope
- correct DesignVersion binding
- expiration
- revocation
- comment permission
- approval permission
- access to unrelated project is denied
- revoked link is immediately unusable according to the documented revocation behavior

Share-link tests must be separate from normal authenticated-user session tests.

Public review endpoints must have rate limiting and abuse protections appropriate to their exposure.

---

## 15. File Upload Testing

Test:

- supported MIME type
- unsupported MIME type
- size below limit
- size above limit
- empty file
- malformed file
- dangerous filename
- path traversal attempt
- duplicate upload
- unauthorized download
- expired/invalid signed access

Uploaded filenames must never become filesystem paths or object keys without controlled normalization.

Where file inspection is required, validate actual content in addition to client-provided MIME metadata.

---

## 16. 2D Editor Testing

### 16.1 Component behavior

Test:

- select object
- move object
- resize supported object
- create supported object
- delete supported object
- snap behavior
- dimension updates
- validation feedback
- rejected edit rollback

### 16.2 Command boundary

The editor should produce domain/application commands rather than directly mutating persistence state.

Each editor command needs at least one test proving invalid operations are rejected.

### 16.3 Undo/redo

Test:

- single edit → undo returns previous state
- undo → redo restores edited state
- multiple edits preserve order
- rejected command does not create a history entry
- server conflict does not corrupt local history

### 16.4 Rendering correctness

For stable representative plans, verify that rendered geometry corresponds to canonical geometry.

Visual regression may be added for a small curated set rather than every test case.

---

## 17. 3D Testing

3D is a projection of canonical design state.

Tests must focus on derivation correctness rather than pixel-perfect rendering.

Verify:

- every eligible wall becomes corresponding wall geometry
- floor geometry follows canonical rooms
- doors/windows use the correct host walls
- staircase uses the correct floor relationship
- unsupported geometry is handled explicitly
- changes in canonical design are reflected in 3D derivation
- no persistent independent 3D design model is created

Where possible, test scene-generation data before browser rendering.

---

## 18. Walkthrough Testing

Test the navigation data and browser behavior for:

- valid spawn point
- movement within allowed space
- wall collision
- floor switching
- invalid/missing navigation data
- no clipping through protected wall geometry within supported MVP constraints
- fallback behavior when WebGL is unavailable

Browser-level walkthrough tests should remain small because WebGL tests can be environment-sensitive.

---

## 19. Plan Analysis Testing

Plan analysis must be deterministic for deterministic input.

Test:

- room counts
- area calculations
- dimension checks
- adjacency checks
- circulation findings
- hard-constraint findings
- soft-preference findings
- severity levels
- stable issue identifiers

Analysis results must clearly distinguish:

```text
error / hard violation
warning / soft preference issue
info / observation
```

---

## 20. Versioning and Concurrency Testing

Test:

- create immutable version
- list versions
- retrieve version
- compare versions
- restore version
- prevent mutation of historical versions
- concurrent update succeeds for current revision
- stale update produces conflict
- autosave does not silently overwrite newer state

Concurrency tests should run against the actual persistence layer where race behavior matters.

---

## 21. Export Testing

Required MVP exports must be tested for:

- successful generation
- correct design version
- correct project metadata
- correct geometry representation
- predictable failure on invalid design state
- unauthorized export denial
- file-access permissions

PDF tests should verify structural content and metadata before relying on visual comparison.

JSON export tests should verify schema validity and round-trip compatibility where supported.

---

## 22. Frontend Accessibility Testing

Core pages and workflows must test:

- keyboard navigation
- visible focus
- form labels
- button names
- error association
- dialog semantics
- sufficient non-color-only status communication
- reduced-motion support where relevant
- screen-reader-friendly critical controls

Accessibility checks should be incorporated into component and E2E coverage rather than treated as a final manual-only activity.

---

## 23. Security Testing

### 23.1 Input security

Test:

- malformed JSON
- oversized requests
- unexpected object keys
- path traversal
- unsafe URLs where applicable
- injection-shaped strings

### 23.2 Authentication

Test:

- invalid credentials
- expired session/token
- revoked session/token
- missing authentication
- privilege escalation attempts

### 23.3 Authorization

Covered by tenant and role matrix tests.

### 23.4 AI security

Test prompt-injection-like content and malicious structured output.

AI output must be treated as untrusted data.

### 23.5 Secrets

CI must fail when expected secret files or obvious credential patterns are accidentally committed according to the repository's secret-scanning policy.

Real production credentials must never appear in test fixtures.

---

## 24. Performance Testing

Performance testing should validate the documented engineering budgets without turning them into absolute correctness guarantees.

### 24.1 Design engine

Measure:

- typical generation time
- complex but valid inputs
- no-feasible-solution time
- worst bounded search behavior
- memory usage

Regression threshold should be configured relative to a known baseline rather than relying on a single absolute number.

### 24.2 API

Measure representative endpoint latency and database query behavior.

Focus on:

- project loading
- active design loading
- concept generation polling/result retrieval
- version listing
- analysis

### 24.3 Frontend

Measure:

- initial application load
- editor interaction responsiveness
- large-plan rendering
- 3D scene load
- memory growth during repeated edits/navigation

### 24.4 Performance regression suite

A lightweight performance suite should run on representative fixtures in CI.

Long-running benchmark suites may run separately from normal pull-request tests.

---

## 25. Browser E2E Strategy

Playwright should cover the minimum critical journeys:

### Journey A — Project creation

```text
Login
→ Create project
→ Enter plot/site
→ Save
```

### Journey B — Requirements to design brief

```text
Enter requirements
→ Request AI brief
→ Validate structured intent
→ Confirm intent
```

### Journey C — Concept generation

```text
Generate concepts
→ Receive valid concepts
→ Select concept
→ Activate concept
```

### Journey D — 2D to 3D

```text
Open design
→ Edit valid geometry
→ Save
→ Open 3D
→ Verify updated scene
```

### Journey E — Versioning

```text
Edit
→ Save version
→ Modify
→ Restore previous version
```

### Journey F — Client review

```text
Create review
→ Create share link
→ Open public review
→ Comment/approve within scope
→ Revoke link
→ Verify access is denied
```

E2E suites should use isolated test tenants/projects and deterministic fixtures.

---

## 26. Test Data Isolation

Tests must never depend on production customer data.

Each test run should use:

- isolated database state
- synthetic identities
- deterministic IDs where useful
- local/test storage
- mocked or controlled AI provider responses

Tests must clean up or recreate their state so order does not matter.

---

## 27. Mocking Strategy

### Mock at external boundaries

Appropriate mocks include:

- Gemini provider
- object storage
- email/notification service if introduced
- external observability transport

### Do not mock domain logic

The domain and design engine should normally execute real code in tests.

### Database

Use a real isolated test database for tests whose purpose includes:

- SQL behavior
- transaction behavior
- constraints
- authorization-scoped queries
- concurrency

Do not replace all persistence testing with mocked repositories.

---

## 28. Golden Fixtures and Snapshot Policy

Snapshots/golden files may be used for stable structured outputs such as:

- normalized DesignIntent
- canonical geometry
- analysis results
- export JSON
- deterministic engine results

Snapshots must not be blindly updated to make CI green.

Every intentional snapshot change should explain why the behavior changed.

Avoid giant opaque snapshots for UI trees; prefer targeted semantic assertions.

---

## 29. Mutation and Negative Testing

The highest-value mutation targets are:

- constraint checks
- authorization predicates
- version immutability
- tenant predicates
- geometry intersection logic
- opening validation
- AI output validation

The team should periodically introduce controlled mutations or targeted fault injection to verify that important tests actually fail when critical logic is broken.

A separate mutation-testing dependency is not required for MVP.

---

## 30. CI Quality Gates

Every pull request should run, at minimum:

```text
format check
lint
TypeScript typecheck
unit tests
domain tests
design-engine tests
API/integration tests
frontend component tests
build
```

Critical E2E tests should run before merge when infrastructure permits.

Security-sensitive suites and full browser suites may run in an additional CI stage if total runtime becomes too high for every local change.

### Merge rule

No merge should occur when a required quality gate fails unless the repository has an explicit, documented exception process.

Skipped tests must be visible and justified.

---

## 31. Release Readiness Gates

Before a production release, verify:

- required unit/domain/engine tests pass
- critical API integration tests pass
- critical E2E journeys pass
- typecheck/lint/build pass
- migration tests pass
- security regression suite passes
- authorization matrix tests pass
- client review sharing tests pass
- export tests pass
- no known critical open defect remains without explicit acceptance

Release approval is based on evidence from the relevant test suites, not on a claim of zero defects.

---

## 32. Defect Severity

Use a simple severity model:

### Critical

Examples:

- cross-tenant data access
- unauthorized client review access
- corrupted canonical design state
- invalid hard-constraint design accepted as valid
- historical version mutation

### High

Examples:

- concept generation fails for common valid input
- major editor corruption
- incorrect save/restore behavior
- major export corruption

### Medium

Examples:

- significant UI workflow defect
- non-critical analysis mismatch
- degraded but usable performance

### Low

Examples:

- cosmetic defect
- minor copy/layout issue
- non-blocking edge-case behavior

Critical and high defects affecting trust, security, data integrity, or core workflows require explicit resolution before release according to the project's release policy.

---

## 33. Flaky Test Policy

Flaky tests must not simply be retried indefinitely.

When a test flakes:

1. capture evidence
2. identify environmental vs product cause
3. reproduce locally when possible
4. fix the cause
5. quarantine only with an owner, reason, and expiry date

A permanently skipped flaky test is not an acceptable substitute for fixing unstable test infrastructure.

---

## 34. Test Review Checklist

For every substantial feature, reviewers should confirm:

```text
[ ] Happy path tested
[ ] Validation failure tested
[ ] Authorization tested
[ ] Persistence behavior tested
[ ] Error behavior tested
[ ] Concurrency impact considered
[ ] Tenant isolation considered
[ ] Audit/security impact considered
[ ] Performance impact considered
[ ] Accessibility impact considered
[ ] E2E impact considered
[ ] Documentation/fixtures updated if behavior changed
```

Geometry-related changes additionally require:

```text
[ ] Numerical tolerance considered
[ ] Topology invariants tested
[ ] Hard constraints tested
[ ] Soft preference behavior tested
[ ] Deterministic seed behavior tested
[ ] Golden fixtures reviewed
[ ] 2D projection reviewed
[ ] 3D projection impact reviewed
```

---

## 35. Definition of Done for Tests

A feature is not considered test-complete merely because one successful test exists.

Test completeness means the affected boundary has appropriate coverage for:

- expected behavior
- invalid input
- security/authorization
- persistence
- error paths
- important edge cases
- integration impact
- regression risk

Coverage percentages may be used as a signal, but coverage alone must not define correctness.

---

## 36. Recommended Implementation Order for Testing Infrastructure

1. Vitest configuration and shared test utilities.
2. Domain fixture and factory infrastructure.
3. Design-engine deterministic test suite.
4. API integration test harness with isolated PostgreSQL.
5. Frontend component test harness.
6. Playwright E2E setup with seeded test data.
7. Authorization/tenant isolation matrix.
8. AI provider mock/contract harness.
9. Performance regression fixtures.
10. Security regression suite.
11. CI quality gates.

Testing infrastructure should be implemented before large feature expansion so that each following milestone arrives with its intended regression protection.

---

## 37. Architecture Invariants Under Test

The following invariants must have automated regression tests and should be treated as non-negotiable:

1. HouseDesign is the authoritative design geometry source.
2. AI cannot directly create authoritative geometry without deterministic validation.
3. Hard constraints cannot be bypassed to produce a valid concept.
4. Soft preferences never override hard constraints.
5. Same deterministic input and seed produce reproducible engine behavior for the same engine version.
6. Historical DesignVersion records are immutable through normal application operations.
7. Tenant boundaries are enforced server-side.
8. Client share links expose only their documented scope.
9. Invalid editor commands do not persist invalid canonical state.
10. 3D is derived from canonical design state rather than becoming a second authoritative model.
11. Production API errors do not expose sensitive internal details.
12. Test suites remain independent from production customer data.

---

## 38. Test Strategy Open Questions

1. Which PostgreSQL test-isolation strategy will be selected for CI: per-test transaction, per-worker database/schema, or disposable database instance?
2. Which minimum browser/device matrix will be supported for MVP desktop and mobile-responsive behavior?
3. Which 3D/WebGL environments will be included in mandatory CI versus nightly/manual verification?
4. When should visual regression become mandatory for the 2D editor and generated PDF exports?
5. What benchmark fixture set will define the initial design-engine performance baseline?
6. Which security scanner/secret-scanning mechanism will be used in CI without adding unnecessary paid infrastructure?

---

## 39. Final Testing Standard

The testing system should make the product safer as it becomes more capable.

The most important test boundary is the transition into authoritative HouseDesign state. Every path into that state must be validated, authorized, deterministic where expected, and covered by regression tests.

The test suite should therefore prioritize correctness of geometry, constraints, domain invariants, authorization, versioning, and canonical-state integrity before optimizing for raw test count or superficial code coverage.
