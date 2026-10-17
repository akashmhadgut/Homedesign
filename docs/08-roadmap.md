# AI Home Designer — Implementation Roadmap

## 1. Purpose

This roadmap converts the approved product vision, requirements, architecture, domain model, API contracts, design-engine specification, testing strategy, and security model into an implementation sequence.

The roadmap is intentionally dependency-driven. The team must build and validate the canonical domain and deterministic design engine before investing heavily in visualization and collaboration features.

The roadmap does not authorize scope expansion. A later phase must not silently introduce a new authoritative model, bypass the canonical House Design Model, or weaken domain/security boundaries established in the architecture.

---

## 2. Delivery Principles

1. **Canonical model first** — the House Design Model remains the source of truth for all downstream features.
2. **Deterministic geometry first** — AI interprets requirements; deterministic code owns geometry, constraints, validation, and layout generation.
3. **Vertical slices over isolated screens** — each major milestone should produce a runnable, testable capability.
4. **Security from the beginning** — tenant isolation, authorization, validation, and auditability are implemented with the feature rather than deferred to the end.
5. **Test every domain invariant** — geometry and business rules require automated tests before dependent UI is considered complete.
6. **Keep infrastructure replaceable** — provider-specific AI, storage, and deployment integrations remain behind interfaces.
7. **Do not optimize prematurely** — measure actual bottlenecks before introducing workers, virtualization, caches, or additional services.
8. **No construction-authoritative claims** — the product remains a conceptual residential planning and visualization system, not structural engineering, legal surveying, or approval certification software.

---

## 3. Milestone Map

| Phase | Primary Outcome                                 | Depends On              |
| ----- | ----------------------------------------------- | ----------------------- |
| 0     | Repository and engineering foundation           | None                    |
| 1     | Canonical domain model                          | 0                       |
| 2     | Deterministic design engine                     | 1                       |
| 3     | API, persistence, authentication, authorization | 1                       |
| 4     | Frontend application foundation                 | 0, 1, 3                 |
| 5     | Project → requirements → AI design brief flow   | 2, 3, 4                 |
| 6     | Concept generation and plan analysis            | 2, 3, 5                 |
| 7     | Production 2D editor                            | 2, 4, 6                 |
| 8     | Versioning and collaboration foundations        | 3, 7                    |
| 9     | 3D preview and walkthrough                      | 7                       |
| 10    | Client review and export                        | 8, 9                    |
| 11    | Professional workspace, usage, hardening        | 3, 8, 10                |
| 12    | Release readiness and production launch         | All required MVP phases |

---

# 4. Phase 0 — Repository & Engineering Foundation

## Objective

Create the development foundation without implementing product behavior.

## Scope

- Monorepo/workspace structure.
- `apps/web`.
- `apps/api`.
- `packages/domain`.
- `packages/design-engine`.
- `packages/ui`.
- `packages/config`.
- Shared TypeScript configuration.
- Strict TypeScript mode.
- ESLint and Prettier.
- Vitest configuration.
- React Testing Library setup.
- Playwright setup.
- Environment-variable conventions.
- Basic CI quality checks.

## Exit Criteria

- Clean install succeeds.
- Type checking succeeds.
- Linting succeeds.
- Formatting check succeeds.
- Unit-test runner works.
- Browser-test runner works with a minimal smoke test.
- No product/domain logic has been placed in React components or controllers.

---

# 5. Phase 1 — Canonical Domain Model

## Objective

Implement the first executable version of the canonical House Design Model.

## Core Areas

- Project.
- Tenant/workspace ownership.
- Plot and site.
- Requirement.
- DesignIntent.
- HouseDesign.
- Floor/level representation.
- Room.
- Wall.
- Door.
- Window.
- Staircase.
- Furniture.
- Dimensions.
- Orientation.
- Constraint.
- Preference.
- DesignVersion.
- ClientReview.
- ShareLink.

## Required Guarantees

- Stable identifiers.
- Explicit relationships.
- Units and coordinate-system conventions.
- Valid geometry representation.
- Valid ownership references.
- Immutable saved versions.
- Mutable active draft separated from saved snapshots.
- Optimistic concurrency/version field.
- Domain-level validation independent of the HTTP layer.

## Testing Gate

Before continuing, add automated tests for:

- model construction;
- serialization/deserialization;
- geometry invariants;
- ownership invariants;
- invalid dimension handling;
- invalid references;
- version snapshot immutability;
- optimistic concurrency behavior.

---

# 6. Phase 2 — Deterministic Design Engine

## Objective

Build the geometry and layout engine before depending on AI or UI generation.

## Engine Stages

1. Normalize plot/buildable area.
2. Normalize room/program requirements.
3. Classify hard constraints.
4. Classify soft preferences.
5. Establish room candidates.
6. Establish mandatory adjacency relationships.
7. Generate candidate placements.
8. Resolve circulation.
9. Resolve openings and access.
10. Validate geometry.
11. Evaluate preferences.
12. Deduplicate concepts.
13. Rank concepts by documented deterministic criteria without treating the ranking as an AI judgment.
14. Return up to the configured concept target, with structured reasons when fewer are feasible.

## Determinism

Given the same normalized input and seed, the engine must produce the same result.

The seed must be explicit and persisted with generation metadata so a concept can be reproduced for debugging and testing.

## Failure Handling

The engine must not manufacture a layout when hard constraints are contradictory.

It must return structured diagnostics identifying conflicts such as:

- insufficient buildable area;
- impossible room dimensions;
- impossible adjacency requirements;
- incompatible access/circulation requirements;
- staircase constraints that cannot fit;
- excessive required program for the available plot.

## Testing Gate

Use fixed fixtures and seeded runs to verify:

- no room overlap;
- geometry remains inside allowed boundaries;
- minimum dimensions are respected;
- doors/windows are valid;
- circulation is preserved;
- staircase requirements are preserved;
- hard constraints never fail silently;
- concept generation is reproducible;
- generated concepts are materially distinct according to deterministic diversity rules.

---

# 7. Phase 3 — Backend, Persistence & Security Foundation

## Objective

Build the secure application/API foundation around the domain model.

## Scope

- Express application foundation.
- API routing and versioning.
- DTO validation.
- Service layer.
- Repository interfaces.
- Prisma persistence.
- PostgreSQL schema.
- Authentication.
- Tenant/workspace membership.
- Role-based authorization.
- Tenant-scoped queries.
- Standardized errors.
- Audit-event foundation.
- Rate limiting boundaries.
- Secure environment/config handling.

## Security Gate

Demonstrate tests for:

- authenticated resource access;
- unauthorized access;
- cross-tenant access denial;
- object-level authorization;
- malformed request rejection;
- invalid IDs;
- privilege escalation attempts;
- secure error responses.

No frontend-only authorization is acceptable.

---

# 8. Phase 4 — Frontend Application Foundation

## Objective

Create the application shell that can consume the backend safely.

## Scope

- React/Vite application.
- Routing.
- Authentication state.
- Tenant/workspace context.
- Application layout.
- Shared UI primitives.
- API client boundary.
- Query/loading/error conventions.
- Zustand only for state that truly belongs at application level.
- Accessibility foundations.
- Responsive layout foundations.

## Rule

Do not duplicate business rules from the domain package in components.

UI state and temporary interaction state may exist in the frontend, but authoritative design data must remain governed by the canonical domain/application boundary.

---

# 9. Phase 5 — Project Setup, Requirements & AI Design Brief

## Objective

Implement the first complete user-facing planning workflow.

## Flow

Project Setup
→ Plot & Site
→ Home Requirements
→ Design Preferences
→ AI Design Brief

## AI Pipeline

Natural language input
→ provider abstraction
→ structured output
→ schema validation
→ normalization
→ business validation
→ domain validation
→ deterministic processing

## AI Restrictions

The AI must not:

- create authoritative wall geometry;
- bypass hard constraints;
- directly write arbitrary database state;
- execute generated code;
- bypass authorization;
- become the source of truth for project state.

## AI Provider Strategy

Keep Gemini behind an application interface so the domain and design engine do not depend on provider-specific SDK objects.

Store sufficient metadata for reproducibility and debugging without storing unnecessary sensitive prompt content.

## Exit Criteria

A user can create a project, provide requirements, receive a validated structured DesignIntent, and inspect the resulting design brief.

---

# 10. Phase 6 — Concept Generation & Plan Analysis

## Objective

Connect the validated DesignIntent to the deterministic engine and expose useful concept analysis.

## Scope

- Generation request orchestration.
- Generation metadata.
- Seed persistence.
- Concept storage.
- Constraint diagnostics.
- Plan validation.
- Dimension checks.
- Adjacency checks.
- Circulation checks.
- Basic Vastu preference analysis.
- Concept comparison metadata.

## Vastu Boundary

Vastu remains a configurable traditional preference system.

The product may report whether configured preferences are satisfied, partially satisfied, or conflict with other constraints. It must not represent these checks as scientific guarantees.

## Exit Criteria

The user can request generation and receive validated concepts or a structured feasibility failure.

---

# 11. Phase 7 — Production 2D Editor

## Objective

Allow controlled editing of a generated concept while preserving domain invariants.

## Scope

- SVG renderer.
- Pan/zoom.
- Selection.
- Move/resize operations.
- Wall editing.
- Room editing.
- Doors/windows.
- Staircase editing.
- Furniture placement where supported.
- Dimensions.
- Snapping.
- Constraint visualization.
- Validation feedback.
- Undo/redo.
- Autosave/debounced persistence.
- Keyboard accessibility where applicable.

## Command Boundary

Editor interactions should become explicit commands/actions rather than arbitrary mutation of the model.

Examples:

- MoveWall.
- ResizeRoom.
- MoveOpening.
- AddDoor.
- DeleteFurniture.
- ChangeRoomType.

Commands pass through domain validation before authoritative state changes.

## Exit Criteria

Every valid edit updates the canonical design state and every invalid edit is rejected without corrupting the model.

---

# 12. Phase 8 — Versioning & Collaboration Foundations

## Objective

Make the design workflow safely revision-oriented.

## Scope

- Draft versioning.
- Immutable saved versions.
- Version metadata.
- Restore.
- Version comparison foundation.
- Optimistic concurrency.
- Audit history.
- Revision labels/notes.
- Project-level collaboration permissions.

## Required Behavior

Restoring an old version creates/replaces the active draft according to the approved versioning model; it does not mutate the historical snapshot.

Concurrent writes must not silently overwrite another user's changes.

---

# 13. Phase 9 — 3D Preview & Walkthrough

## Objective

Project the canonical model into interactive 3D without creating a second authoritative model.

## 3D Scope

- Floor geometry.
- Wall geometry.
- Doors.
- Windows.
- Staircase.
- Ceiling representation where appropriate.
- Basic furniture.
- Materials.
- Lighting baseline.
- Camera controls.
- Floor switching.

## Walkthrough Scope

- First-person movement.
- Spawn point.
- Collision handling.
- Basic floor transitions.
- Performance safeguards.
- WebGL failure fallback.

## Important Boundary

3D-specific visual representation may be cached or derived, but canonical architectural geometry must remain in the House Design Model.

---

# 14. Phase 10 — Client Review & Export

## Objective

Allow secure presentation and review of a saved design version.

## Client Review

- Version-specific review links.
- Opaque secure tokens.
- Explicit scope.
- Expiration.
- Revocation.
- Read/comment/approval capabilities according to the approved permission model.
- No access to unrelated projects or versions.

## Export

MVP export targets:

- PDF.
- Canonical JSON/design package.

Future formats such as DXF remain outside the initial MVP unless separately approved.

## Exit Criteria

A user can share a specific version safely, collect supported review actions, revoke the link, and export the design.

---

# 15. Phase 11 — Professional Workspace & Usage

## Objective

Add the professional SaaS capabilities after the core design workflow is stable.

## Scope

- Projects dashboard.
- Workspace/company management.
- Team members.
- Roles and permissions expansion.
- Usage tracking.
- Project filtering/search.
- Activity/audit views.
- Professional workflow polish.

Billing/payment functionality remains a later concern unless explicitly promoted into scope.

---

# 16. Phase 12 — Production Hardening & Release

## Objective

Prepare the approved MVP for controlled production release.

## Required Areas

### Security

- Authorization review.
- Tenant-isolation review.
- Upload security review.
- Token review.
- Secret review.
- Dependency audit.
- Rate-limit review.
- Abuse-case testing.

### Reliability

- Database backup/restore verification.
- Migration validation.
- Failure/retry behavior.
- AI-provider failure handling.
- Storage failure handling.
- Partial-operation recovery.

### Performance

- API latency measurement.
- Design-engine benchmarks.
- 2D editor responsiveness.
- 3D load/memory checks.
- Mobile-browser checks.
- Large-project testing.

### Accessibility

- Keyboard flows where applicable.
- Focus management.
- Labels and semantics.
- Contrast.
- Error messaging.
- Reduced-motion considerations.
- Non-WebGL fallback.

### Observability

- Structured server logs.
- Request correlation IDs.
- Design-generation timing.
- AI provider timing/failure metrics.
- Error tracking with PII controls.
- Security/audit events.

---

# 17. MVP Definition

The initial MVP should include the smallest coherent end-to-end workflow that demonstrates the core product value:

1. User authentication.
2. Project creation.
3. Plot/site definition.
4. Home requirements.
5. Design preferences.
6. AI-generated structured DesignIntent.
7. Deterministic concept generation.
8. Plan validation and analysis.
9. 2D editing.
10. Saved versions.
11. 3D preview.
12. Basic walkthrough.
13. Secure client review.
14. PDF/JSON export.

Professional workspace capabilities can be layered on after the core loop is stable.

---

# 18. Features Explicitly Deferred Unless Re-approved

The following must not enter the codebase merely because they are technically interesting:

- structural engineering calculations;
- legal/authority approval automation;
- land-survey certification;
- construction-ready CAD/BIM certification;
- advanced sunlight simulation;
- advanced environmental simulation;
- high-end photorealistic rendering;
- arbitrary free-form curved-wall solving if not supported by the MVP geometry model;
- full DXF/CAD interoperability;
- complex multi-service microservice decomposition;
- sophisticated optimization/AI planning agents that replace deterministic geometry rules.

---

# 19. Recommended Implementation Loop

Every feature should follow the same delivery loop:

**Specify → Model → Implement domain rules → Test → Add API/application service → Add UI → Add E2E coverage → Security review → Performance check → Documentation update.**

Do not build a UI feature first and retrofit business rules afterward.

---

# 20. Definition of Done

A milestone is complete only when:

- requirements are traceable;
- domain rules are implemented at the correct boundary;
- automated tests cover important success and failure cases;
- authorization has been tested;
- no tenant-isolation regression exists;
- errors are observable and safe;
- documentation matches the implementation;
- no duplicate authoritative model has been introduced;
- lint/type/test gates pass;
- the feature works in the supported browser scenarios;
- known limitations are documented.

---

# 21. First Implementation Target After Planning

The first implementation milestone should be **Phase 0 — Repository & Engineering Foundation**.

Do not begin with:

- the AI prompt;
- the 3D viewer;
- the 2D editor UI;
- authentication screens;
- a large dashboard;
- production deployment.

The foundation must be established first so later work is built on the approved architecture rather than requiring structural rewrites.

---

# 22. Roadmap Open Questions

1. What minimum number of concepts should be accepted when fewer than the target count are feasible?
2. What exact review-link expiration defaults should be used, and which scopes are permitted for each link type?
3. Will the MVP support only orthogonal walls, or a deliberately limited set of non-orthogonal geometry?
4. What deployment provider will be selected for the first production environment?
5. At what measured workload should layout generation move from the API process to a dedicated worker/runtime?

These questions must be resolved at the relevant implementation milestone rather than becoming implicit architectural decisions in code.
