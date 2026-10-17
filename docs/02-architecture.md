# System Architecture Document

## 1. Purpose

This document defines the production-oriented architecture for the AI Home Designer. It translates the approved product vision and requirements into clear technical boundaries, data ownership rules, security controls, and an implementation sequence.

The architecture is intentionally modular so that the first release can be built with a small engineering team and low infrastructure cost while preserving a path to larger professional and multi-tenant workloads.

### 1.1 Approved product

AI-assisted residential concept-design and visualization platform for:

- Homeowners
- Builders
- Contractors
- Architects
- Engineers
- Construction companies

### 1.2 Core product flow

Plot & Site
→ Home Requirements
→ Design Preferences
→ AI Design Brief
→ Constraint Model
→ Concept Generation
→ Plan Analysis
→ 2D Editor
→ Versioning
→ 3D Preview
→ Walkthrough
→ Client Review
→ Export

### 1.3 Architectural goals

The system must:

1. Keep the House Design Model as the single authoritative design representation.
2. Keep AI advisory and structured-output oriented; AI must not own geometry or persistence authority.
3. Keep geometry, constraints, validation, and layout generation deterministic and testable.
4. Enforce authorization on the server for every tenant-owned resource.
5. Make versions immutable once saved.
6. Allow the 2D editor and 3D renderer to consume the same canonical design state.
7. Support personal and company workspaces without creating separate application architectures.
8. Start with a low-complexity deployment model and introduce workers or additional services only when measured workloads require them.

### 1.4 Product boundary

The product is a residential concept-design and visualization system. It is not authoritative structural engineering, legal surveying, statutory approval software, or construction-certification software.

Site/photo analysis is assistive. Vastu is implemented as a configurable traditional preference system and must not be represented as scientific validation.

---

## 2. Architectural Principles

### 2.1 Canonical model principle

The `HouseDesign` model is the single source of truth for design state.

It powers:

- 2D rendering
- 2D editing
- layout validation
- plan analysis
- 3D generation
- walkthrough
- export
- client review

There is no separate authoritative 2D model and no separate authoritative 3D model.

### 2.2 Deterministic geometry principle

Geometry created or changed by the product must pass deterministic domain validation. AI may propose structured intent; it does not directly create authoritative geometry.

### 2.3 Layering principle

Dependencies point inward toward stable business rules:

`Presentation → Application → Domain`

Infrastructure and persistence implement ports required by the application/domain boundaries and must not leak vendor-specific concerns into the core domain.

### 2.4 Server-authority principle

The browser is an untrusted client. Frontend route guards and UI permissions are usability features only. Authorization, tenant isolation, version access, share-link scopes, and file access are always enforced on the server.

### 2.5 Validate-before-persist principle

Untrusted input is validated before it reaches authoritative state. This includes:

- API request bodies
- query parameters
- uploaded files
- AI outputs
- client review actions
- imported/future external design data

### 2.6 Minimal-infrastructure principle

The MVP uses one web app, one API, one PostgreSQL database, and object storage. Background workers, queues, Redis, microservices, and complex orchestration are added only when profiling demonstrates a need.

---

## 3. Technology Stack

### 3.1 Frontend

- React
- Vite
- TypeScript with strict mode
- Tailwind CSS
- React Router
- Zustand for client-side application state where global state is required
- SVG for the initial 2D editor/rendering layer

### 3.2 Backend

- Node.js
- Express
- TypeScript with strict mode
- Zod for transport-boundary validation

### 3.3 Database

- PostgreSQL
- Prisma for persistence access and migrations

### 3.4 Design and rendering

- Shared TypeScript domain types/schemas
- Deterministic layout engine in `packages/design-engine`
- SVG for 2D
- Three.js + React Three Fiber for 3D

### 3.5 AI

- Gemini behind an `AIProvider` abstraction
- Provider-specific SDK code isolated to infrastructure

### 3.6 Testing

- Vitest
- React Testing Library
- Playwright

### 3.7 Engineering quality

- ESLint
- Prettier
- TypeScript strict mode
- Conventional project scripts for lint, typecheck, unit tests, integration tests, and E2E tests

No additional major technology is required for MVP unless an implementation decision below explicitly introduces it.

---

## 4. System Context

```text
                         ┌──────────────────────┐
                         │   Browser / Web App  │
                         │ React + Vite         │
                         │ 2D + 3D + Projects   │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │     Node / Express   │
                         │ Application Services │
                         └──────┬─────┬─────┬───┘
                                │     │     │
              ┌─────────────────┘     │     └─────────────────┐
              ▼                       ▼                       ▼
      ┌────────────────┐    ┌────────────────┐      ┌────────────────┐
      │ Domain +       │    │ AI Provider    │      │ Storage        │
      │ Design Engine  │    │ abstraction    │      │ abstraction    │
      └───────┬────────┘    └───────┬────────┘      └───────┬────────┘
              │                     │                       │
              ▼                     ▼                       ▼
      ┌────────────────┐    ┌────────────────┐      ┌────────────────┐
      │ PostgreSQL     │    │ Gemini         │      │ Object Storage │
      │ + Prisma       │    │ provider      │      │ private assets │
      └────────────────┘    └────────────────┘      └────────────────┘
```

The browser never talks directly to PostgreSQL, Gemini, or private object storage.

---

## 5. Monorepo Structure

Use npm workspaces initially. A task/build orchestrator such as Turborepo may be introduced later only when the repository size or CI execution time justifies it.

```text
/
├─ apps/
│  ├─ web/                      # React + Vite application
│  └─ api/                      # Express + TypeScript API
│
├─ packages/
│  ├─ domain/                   # Canonical model, domain rules, validators
│  ├─ design-engine/            # Deterministic layout generation/validation
│  ├─ ui/                       # Reusable presentational UI primitives
│  └─ config/                   # Shared TS/ESLint/Prettier configuration
│
├─ docs/
│  ├─ 00-product-vision.md
│  ├─ 01-requirements.md
│  ├─ 02-architecture.md
│  ├─ 03-domain-model.md
│  ├─ 04-api-contracts.md
│  ├─ 05-design-engine.md
│  ├─ 06-testing-strategy.md
│  ├─ 07-security-model.md
│  └─ 08-roadmap.md
│
├─ tests/
│  └─ e2e/                      # Playwright end-to-end tests
│
├─ package.json
└─ package-lock.json
```

### Package ownership rules

- `domain` must not import from `apps/web` or `apps/api`.
- `design-engine` may depend on `domain`, but not on React, Prisma, Express, or browser APIs.
- `ui` may depend on React and styling primitives but must not contain business rules.
- `apps/api` owns HTTP, authentication, repositories, external integrations, and application orchestration.
- `apps/web` owns routes, screens, editor interactions, and view state.

---

## 6. Layered Architecture

### 6.1 Presentation layer

Responsibilities:

- React pages and components
- routing
- form state
- editor interaction
- rendering
- accessibility
- display of validation and analysis results

Presentation must not contain rules such as room-overlap checks, tenant authorization, or Vastu evaluation algorithms.

### 6.2 Application layer

Application services orchestrate use cases such as:

- CreateProject
- UpdateProjectRequirements
- GenerateDesignBrief
- GenerateConcepts
- AnalyzeDesign
- ApplyDesignEdit
- SaveDesignVersion
- RestoreDesignVersion
- CreateClientReviewLink
- RevokeClientReviewLink
- ExportDesign

Application services coordinate domain logic, repositories, AI providers, and storage ports.

### 6.3 Domain layer

Contains:

- House Design Model
- value objects
- geometry primitives
- hard constraints
- soft preferences
- validation rules
- design-edit commands
- version invariants
- deterministic analysis rules

The domain is framework-independent.

### 6.4 Infrastructure layer

Contains implementations for:

- Gemini client
- object storage client
- email or notification provider when introduced
- authentication provider integration if external auth is adopted
- logging and telemetry adapters

### 6.5 Persistence layer

Contains:

- Prisma client
- repositories
- transaction boundaries
- database migrations
- mapping between persistence records and domain structures

Persistence models are not automatically exposed as API response objects.

### 6.6 Rendering layer

Rendering is a projection of canonical domain state.

- 2D: canonical geometry → SVG
- 3D: canonical geometry → Three.js scene graph
- walkthrough: 3D scene + navigable space derived from canonical geometry

---

## 7. Canonical House Design Model

### 7.1 Core entities

The canonical model supports at minimum:

- `Project`
- `Plot`
- `Site`
- `Requirement`
- `DesignIntent`
- `HouseDesign`
- `Room`
- `Wall`
- `Door`
- `Window`
- `Staircase`
- `Furniture`
- `Dimensions`
- `Orientation`
- `Constraint`
- `Preference`
- `DesignVersion`
- `ClientReview`
- `ShareLink`

### 7.2 Ownership hierarchy

```text
Tenant / Personal Workspace
        │
        └── Project
              ├── Plot + Site
              ├── Requirements
              ├── Design Intent
              ├── Active Draft HouseDesign
              ├── Design Versions
              ├── Client Review Links
              └── Assets / Exports
```

A user may own or belong to a workspace. A project belongs to exactly one workspace/tenant. Every tenant-owned resource is transitively scoped to that tenant.

### 7.3 Draft versus immutable version

The architecture distinguishes two states:

**Active Draft**

- mutable
- editable by authorized project members
- contains the current working `HouseDesign`
- has a monotonically increasing revision number for optimistic concurrency

**DesignVersion**

- immutable after creation
- contains a complete canonical snapshot of the design state at save time
- has metadata such as version number, created by, timestamp, title/label, and source revision

This avoids incorrectly treating the active editor state as immutable while keeping saved versions immutable.

### 7.4 Canonical model contents

At minimum, `HouseDesign` contains:

```text
HouseDesign
├─ schemaVersion
├─ units
├─ plot
├─ site
├─ orientation
├─ floors[]
├─ rooms[]
├─ walls[]
├─ doors[]
├─ windows[]
├─ staircases[]
├─ furniture[]
├─ dimensions[]
├─ constraints[]
├─ preferences[]
└─ metadata
```

Each geometric element carries stable IDs so editing, references, comments, validation errors, and rendering can target the same object.

### 7.5 Geometry representation

MVP geometry should be based on explicit 2D coordinates and line/segment primitives, with orthogonal residential layouts preferred.

Walls are represented as centerline or boundary-based segments with thickness rather than as disconnected visual rectangles. Derived wall faces, room polygons, and 3D meshes are generated from canonical geometry.

Junctions are represented by topology derived from intersecting wall segments; the renderer must not depend on fragile hand-authored polygon duplication.

Curved/non-orthogonal geometry remains an explicit capability decision and should not be silently added to MVP.

### 7.6 Validation boundary

A canonical update follows:

```text
User / AI Input
      ↓
Transport Validation
      ↓
Normalization
      ↓
Domain Command
      ↓
Hard-constraint validation
      ↓
Canonical HouseDesign update
```

Invalid updates are rejected before authoritative persistence.

---

## 8. AI Architecture

### 8.1 AI responsibility

AI converts human language and unstructured context into a structured design intent that the application can validate and use.

```text
Natural Language
      ↓
AI Provider
      ↓
Structured DesignIntent
      ↓
Schema Validation
      ↓
Normalization
      ↓
Business Validation
      ↓
Domain Validation
      ↓
Deterministic Design Engine
      ↓
Candidate HouseDesigns
```

### 8.2 AI must never

- write authoritative geometry directly
- bypass hard constraints
- bypass server authorization
- write arbitrary database records
- execute generated code
- decide whether a mathematically invalid layout is acceptable
- silently convert impossible requirements into hidden assumptions

### 8.3 Provider abstraction

Define a provider interface such as:

```ts
interface AIProvider {
  generateDesignIntent(input: DesignIntentPrompt): Promise<AIResult<DesignIntent>>;
}
```

Only the infrastructure adapter knows the Gemini SDK/API details.

### 8.4 Prompt/output handling

AI outputs are treated as untrusted input. The pipeline must:

1. constrain the requested output schema
2. parse structured output
3. validate with a schema
4. normalize values and units
5. run business-level checks
6. run domain validation
7. log safe metadata for observability
8. reject or repair only through deterministic, explicit application rules

Prompts must not contain secrets or unnecessary personal information.

### 8.5 AI failure modes

The application must handle:

- malformed output
- missing fields
- unsupported requests
- provider timeouts
- quota/rate-limit errors
- transient provider failures
- semantically impossible requirements

A failed AI request must not corrupt the active draft.

---

## 9. Deterministic Design Engine

### 9.1 Responsibility

`packages/design-engine` owns deterministic geometry and layout generation.

Responsibilities include:

- plot and buildable-area checks
- room placement
- minimum dimensions
- non-overlap
- adjacency
- circulation
- doors
- windows
- staircase feasibility
- hard constraints
- soft preference evaluation
- layout validation
- concept differentiation

### 9.2 Generation strategy

Do not introduce a full-blown external constraint solver for MVP.

Use a deterministic, seeded, multi-start heuristic pipeline:

1. Normalize requirements into placement constraints.
2. Place fixed/anchor elements first.
3. Generate candidate room placements using feasible rectangles/segments.
4. Reject hard-constraint violations immediately.
5. Repair local conflicts where deterministic repair is possible.
6. Evaluate soft preferences.
7. Apply deterministic local improvement.
8. Deduplicate materially equivalent layouts.
9. Keep the best distinct candidates up to the requested concept count.

This provides multiple concepts without making the first implementation dependent on a heavyweight optimization framework.

### 9.3 Five-concept target

The generation API should default to a target of up to 5 concepts.

The result must explicitly distinguish:

- requested concept count
- generated concept count
- rejected candidates
- unsatisfied soft preferences
- hard conflicts

If five valid concepts cannot be generated, the system returns the valid concepts it can produce plus structured reasons rather than inventing invalid plans.

### 9.4 Reproducibility

Generation requests contain a deterministic seed and an engine version.

A concept should be reproducible for:

`normalizedDesignIntent + generationConfig + engineVersion + seed`

This is critical for debugging, regression tests, and versioned behavior.

### 9.5 Hard versus soft constraints

Hard constraints must never be violated in an accepted concept.

Examples:

- room exceeds plot/buildable boundary
- minimum room dimensions
- forbidden overlaps
- impossible wall topology
- impossible doorway placement
- invalid staircase bounds

Soft preferences can be unmet and reported:

- preferred orientation
- preferred adjacency
- Vastu preferences
- sunlight preferences
- furniture placement preferences

### 9.6 Impossible requirements

The engine must produce a structured conflict report instead of silently weakening requirements.

Example:

```text
GenerationResult
├─ status: CONFLICT
├─ concepts: []
└─ conflicts[]
    ├─ constraintId
    ├─ severity
    ├─ reason
    └─ suggestedRelaxations[]
```

Suggested relaxations are suggestions only; the user decides whether requirements are changed.

---

## 10. Plan Analysis

Plan analysis is a mandatory product capability and operates on canonical design state.

### 10.1 MVP analysis

The analysis layer should report deterministic facts and warnings such as:

- room dimensions
- plot/buildable-area compliance
- overlaps
- circulation/connectivity issues
- inaccessible rooms or disconnected zones
- invalid openings
- staircase rule violations implemented by the engine
- hard-constraint violations
- unsatisfied soft preferences
- orientation/Vastu preference results

### 10.2 Analysis output

Analysis results are structured objects, not free-form prose only.

```text
AnalysisResult
├─ errors[]
├─ warnings[]
├─ info[]
├─ metrics
└─ evaluatedConstraints[]
```

Optional narrative summaries may be generated from the structured result but must not contradict it.

### 10.3 Future analysis

Advanced sunlight, environmental, and site intelligence remain later phases unless explicitly promoted into MVP scope.

---

## 11. 2D Editor Architecture

### 11.1 Rendering

SVG is the initial renderer because residential conceptual plans are expected to contain a manageable number of geometric objects and SVG provides direct event handling, accessibility hooks, and predictable coordinate transforms.

The SVG renderer must separate:

- canonical geometry data
- projection/calculation utilities
- visual components
- interaction state

### 11.2 Coordinate systems

Use an explicit world-coordinate system with defined units.

The renderer converts world coordinates to screen coordinates through a view transform:

```text
world → scale/translation transform → SVG viewport
```

Panning and zooming must not mutate canonical geometry.

### 11.3 Interaction model

Editor actions are represented as domain-oriented commands, for example:

- `MoveWall`
- `ResizeRoom`
- `MoveDoor`
- `MoveWindow`
- `MoveFurniture`
- `AddRoom`
- `DeleteRoom`

The UI calculates the proposed change; the domain validation layer decides whether it is valid.

### 11.4 Snapping

Support deterministic:

- grid snapping
- vertex/endpoint snapping
- wall alignment
- optional angle snapping

Snapping is an editing aid, not a bypass around validation.

### 11.5 Undo/redo

Use a command/history stack for the active draft rather than persisting a database row for every pointer movement.

Each committed editor command contains enough information to undo/redo locally. The active draft is saved to the server using debounced persistence.

### 11.6 Autosave and concurrency

Autosave should send the latest valid draft revision with an expected revision number.

If the server reports a revision conflict:

1. stop overwriting the remote state
2. show a recoverable conflict state
3. reload/merge through an explicit strategy
4. require a user-visible resolution when automatic merge is unsafe

### 11.7 Performance strategy

Avoid unnecessary React rerenders during pointer movement. Keep transient drag state local to the editor interaction and commit a validated canonical command at a controlled frequency.

A renderer change is justified only after profiling shows SVG is insufficient for the actual supported project complexity.

---

## 12. 3D Architecture

### 12.1 Source of truth

The 3D scene is always derived from the canonical `HouseDesign`.

There is no independent persisted authoritative 3D model.

### 12.2 Geometry pipeline

```text
HouseDesign
   ↓
Geometry derivation
   ↓
Wall/floor/opening/furniture descriptors
   ↓
Three.js / React Three Fiber scene
```

### 12.3 Scene mapping

- Rooms → floor regions/meshes
- Walls → extruded wall geometry
- Doors → opening-aware wall segmentation + door leaf/frame geometry
- Windows → opening-aware wall segmentation + frame/glass geometry
- Staircases → deterministic stair geometry
- Furniture → simplified parametric or predefined low-poly assets

### 12.4 Wall openings

MVP should prefer splitting wall segments around doors/windows over CSG where practical.

CSG can be introduced later for cases where segmented wall geometry cannot reasonably satisfy a visual requirement. This avoids making every wall render dependent on expensive Boolean operations.

### 12.5 Updates

Changing the canonical model invalidates the corresponding derived scene descriptors and triggers a targeted scene update/rebuild.

No separate 3D persistence or 2D-to-3D synchronization process is required.

---

## 13. Walkthrough Architecture

### 13.1 Camera

Use a first-person camera with controlled vertical range and collision-aware movement.

### 13.2 Spawn point

Choose a safe, navigable location in or near the main entrance. If no usable entrance exists, use a validated interior location such as the largest connected circulation zone.

### 13.3 Collision

MVP collision must use the canonical wall/opening topology rather than only coarse wall AABBs.

A practical approach is:

- represent walkable floor areas as 2D polygons
- represent blocking wall boundaries as segments
- resolve player movement against those boundaries
- treat stair connections as explicit transition nodes

### 13.4 Floor switching

The walkthrough maintains the current floor and can move between floors through validated staircase connections.

### 13.5 Performance

- low-poly furniture
- instancing for repeated assets
- lazy loading of heavy assets
- limited dynamic lighting
- level-of-detail only when measured scene complexity warrants it

### 13.6 Accessibility/fallback

Provide:

- 2D fallback
- keyboard movement support where practical
- visible controls/help
- non-WebGL error handling

---

## 14. Authentication and Authorization

### 14.1 Authentication

Do not implement custom password cryptography or roll a bespoke identity system.

The authentication boundary should be provider-agnostic. The application consumes a verified identity/session and maps it to application users.

For a first-party web application, prefer secure HTTP-only session/refresh mechanisms rather than storing long-lived bearer tokens in browser local storage.

### 14.2 Application roles

At minimum, support:

- Workspace Owner/Admin
- Team Member
- Client Reviewer via scoped share access

Fine-grained permissions should be expressed as capabilities on project resources rather than relying only on frontend role labels.

### 14.3 Authorization

Every protected resource check must verify:

1. authenticated identity
2. workspace/tenant membership
3. project ownership/membership
4. required action permission
5. resource-specific status constraints where applicable

### 14.4 IDOR/BOLA prevention

Never authorize access from a client-supplied resource ID alone.

Repositories must use tenant/project scope in their queries, for example:

```text
findDesignVersion({ tenantId, projectId, versionId })
```

rather than `findDesignVersion(versionId)`.

---

## 15. Multi-Tenancy

### 15.1 Tenant model

Use a single logical `Tenant`/workspace abstraction for:

- personal homeowner workspaces
- company workspaces

A personal workspace may contain one primary user; the same resource model still applies.

### 15.2 Isolation strategy

MVP uses application-level tenant isolation with `tenantId` on tenant-owned persistence records and mandatory tenant-scoped repository methods.

Database row-level security may be introduced later if operational requirements justify it, but application scoping must remain explicit even if RLS is added.

### 15.3 Isolation requirements

Every read, write, update, delete, share-link lookup, and asset authorization path must preserve tenant boundaries.

Cross-tenant access must be impossible through ordinary API identifiers.

---

## 16. Versioning and Revisions

### 16.1 Version lifecycle

```text
Active Draft
   │
   ├─ Autosave / edit
   │
   └─ Save Version
          ↓
   Immutable DesignVersion
```

### 16.2 DesignVersion contents

A version stores a complete canonical snapshot, not only a diff, so it can be:

- rendered independently
- shared independently
- exported independently
- restored independently
- compared independently

### 16.3 Restore

Restore copies a selected immutable version into a new active draft revision. The original version is never mutated.

This also makes restoration auditable.

### 16.4 Comparison

Version comparison is derived by comparing canonical object IDs, geometry, metadata, requirements/preferences relevant to the design, and version-level metadata.

### 16.5 Concurrency

Use optimistic concurrency with a numeric revision/ETag-like value on the active draft.

Concurrent writes must fail safely instead of silently overwriting newer work.

### 16.6 Audit history

Audit important actions such as:

- project creation
- membership changes
- design generation
- save version
- restore
- export
- share-link creation/revocation
- permission changes

---

## 17. Client Review and Share Links

### 17.1 Share-link design

Client review is intentionally separate from normal authentication.

A share link is an opaque, cryptographically random token stored as a hash in the database.

Do not place authorization scopes or sensitive design information directly into a bearer token when a server-side lookup can provide safer revocation and auditing.

### 17.2 Link scope

A link must identify:

- the specific project/version being shared
- allowed actions
- creation time
- expiration time
- revocation state

Supported MVP scopes:

- read
- comment
- approve, only where the requirements/workflow enables it

### 17.3 Expiration and revocation

Default expiration should be configurable by the product. Every link can be revoked immediately.

All share-link access is authorized on the server.

### 17.4 Comment/approval isolation

Client comments and approvals reference the shared design version. They do not mutate the canonical design directly.

An authorized project member must explicitly incorporate approved changes into the active draft.

---

## 18. File Storage

### 18.1 Assets

Storage must support:

- site images
- survey/reference files where enabled
- exported PDFs
- future design assets

### 18.2 Storage abstraction

Use an `IStorageService` interface so the application is not coupled to one cloud vendor.

Typical operations:

```text
createUploadIntent()
putObject()
getDownloadUrl()
deleteObject()
```

### 18.3 Security

Uploads must enforce:

- maximum file size
- allowlisted content types
- generated object keys
- authenticated ownership checks
- malware/security scanning where operationally appropriate
- no direct public bucket access for private assets

Downloads should use short-lived signed URLs issued only after authorization.

### 18.4 File metadata

The database stores metadata such as:

- tenantId
- projectId
- objectKey
- media type
- size
- checksum where useful
- uploader
- createdAt
- logical purpose

The database does not need to store the entire binary file.

---

## 19. API Architecture

### 19.1 Layering

```text
HTTP Router
   ↓
Authentication / authorization middleware
   ↓
Request validation
   ↓
Controller
   ↓
Application Service
   ↓
Domain / Design Engine
   ↓
Repository / External Port
   ↓
Infrastructure
```

### 19.2 Example resource groups

```text
/api/v1/auth
/api/v1/me
/api/v1/workspaces
/api/v1/projects
/api/v1/projects/:projectId/requirements
/api/v1/projects/:projectId/designs
/api/v1/projects/:projectId/concepts/generate
/api/v1/projects/:projectId/analysis
/api/v1/projects/:projectId/versions
/api/v1/projects/:projectId/share-links
/api/v1/review/:shareToken
/api/v1/projects/:projectId/exports
/api/v1/projects/:projectId/assets
```

Exact routes belong in `docs/04-api-contracts.md` and are not duplicated as the source of truth here.

### 19.3 DTO boundary

API request/response DTOs are explicit contracts. Do not return Prisma models directly.

Validate:

- body
- route parameters
- query parameters
- uploaded metadata

### 19.4 Error model

Use a consistent safe response shape:

```json
{
  "error": {
    "code": "DESIGN_VALIDATION_FAILED",
    "message": "The design could not be saved because it violates a hard constraint.",
    "details": []
  }
}
```

Do not expose stack traces, SQL details, secret values, provider credentials, or internal file paths.

### 19.5 Pagination

List endpoints use explicit pagination. Prefer cursor/keyset pagination where datasets can become large; simple page/limit is acceptable for small MVP lists.

### 19.6 Idempotency

Use idempotency keys for operations where duplicate execution is costly or dangerous, especially:

- concept generation requests
- export creation
- payment/billing operations when billing is introduced

The first MVP implementation may use a request fingerprint + stored operation status where necessary.

---

## 20. Persistence Architecture

### 20.1 Persistence approach

Use PostgreSQL as the transactional source for application metadata and canonical design snapshots.

Prisma owns database access and migrations.

### 20.2 Recommended persistence split

Relational records for:

- users
- tenants
- memberships
- projects
- project metadata
- requirements metadata
- design versions
- share links
- comments
- audit events
- asset metadata

JSONB snapshots for:

- active `HouseDesign`
- immutable `DesignVersion` canonical payloads
- validated `DesignIntent` where full relational querying is not required

This keeps the canonical geometry flexible without creating dozens of tightly coupled geometry tables during MVP.

### 20.3 Database invariants

Enforce relational invariants with:

- primary keys
- foreign keys
- unique constraints
- tenant-scoped unique constraints
- not-null constraints where required
- indexes for tenant/project/version lookup

Domain invariants remain in the domain layer even when database constraints exist.

### 20.4 Transactions

Use transactions for multi-record changes that must be atomic, including:

- save-version workflows
- restore workflows
- membership/role changes
- share-link creation/revocation where multiple records are affected

---

## 21. Security Architecture

### 21.1 Authentication security

- secure transport only in deployed environments
- HTTP-only secure session/refresh cookies where applicable
- secure cookie attributes
- CSRF protection for cookie-authenticated state-changing requests
- credential/session rotation and revocation
- brute-force/rate-limit protection around authentication endpoints

### 21.2 Authorization security

- server-side permission checks
- tenant/project scoped repositories
- default-deny access
- no trust in hidden UI controls

### 21.3 AI security

Treat AI output as hostile/untrusted data.

Never:

- interpolate secrets into prompts
- execute model-generated code
- trust model-generated authorization decisions
- persist raw model output directly as authoritative geometry

### 21.4 File security

- strict upload limits
- MIME/content validation
- generated object names
- non-public private storage
- short-lived signed download URLs
- authorization before issuing the URL

### 21.5 Injection defenses

Use parameterized ORM/database access. Validate and encode values crossing HTML/JS/SQL boundaries. Sanitize user-visible rich content if rich text is ever introduced.

### 21.6 Rate limiting

Rate-limit at least:

- authentication endpoints
- AI generation endpoints
- export endpoints
- share-link abuse-prone endpoints
- file upload creation

AI generation should also enforce tenant/user usage limits.

### 21.7 Secrets

Local development may use `.env` files excluded by Git. Production secrets must be injected by the deployment platform/secret manager.

Secrets must never be committed, logged, or returned to clients.

---

## 22. Testing Architecture

### 22.1 Unit tests

Use Vitest for:

- value objects
- geometry utilities
- constraint evaluators
- normalization
- preference evaluation
- command validation

### 22.2 Design-engine tests

Every engine feature should have deterministic fixtures containing:

- input requirements
- plot/site configuration
- generation configuration
- seed
- expected validity conditions
- expected conflict types

Tests should primarily assert domain invariants and structural properties rather than brittle exact coordinates, except where exact reproducibility is an intentional contract.

### 22.3 API integration tests

Use an isolated test database. Test real repository/application behavior, including:

- tenant isolation
- authorization
- optimistic concurrency
- version creation/restoration
- share-link scope
- validation failures

### 22.4 Component tests

React Testing Library covers:

- forms
- validation states
- editor controls
- loading/error states
- permissions in the UI

### 22.5 E2E tests

Playwright should cover the highest-value journeys:

1. sign in → create project
2. enter plot and requirements
3. generate design intent
4. generate concepts
5. open 2D editor
6. analyze design
7. save version
8. open 3D preview
9. create client review link
10. review/comment/approve according to permission
11. export

### 22.6 Security regression tests

Include explicit tests for:

- cross-tenant resource access
- guessed project/version IDs
- revoked share links
- expired share links
- invalid AI payloads
- oversized uploads
- unsupported file types
- concurrent draft writes

---

## 23. Observability

### 23.1 Structured logging

Use structured JSON logs from the API with:

- timestamp
- level
- request ID
- operation name
- tenant/project identifiers where safe
- duration
- result status
- error code

Never log passwords, access tokens, share tokens, API keys, or sensitive raw design/user content unnecessarily.

### 23.2 Metrics

Track at minimum:

- API latency by route
- API error rate
- AI request count/latency/failure rate
- generation count
- layout-engine duration
- generation success/conflict rate
- export duration
- frontend error count

### 23.3 Audit logs

Audit logs are distinct from application debug logs and record security/business events that matter to the project lifecycle.

### 23.4 Error tracking

An error-tracking adapter may be introduced for production frontend/backend exceptions. It must scrub secrets and sensitive user content before transmission.

---

## 24. Performance Architecture

Performance targets are engineering budgets, not absolute guarantees. They must be measured against representative project complexity and supported devices.

### 24.1 Layout generation

Initial target: keep common generation requests within approximately 10 seconds on the selected deployment profile.

If profiling shows the Node event loop is blocked by generation workloads, move generation to a worker thread/process or background job without changing the design-engine contract.

### 24.2 AI

Initial target: keep common AI requests within approximately 5 seconds where provider/network conditions allow. Timeout and retry policies must prevent request storms.

### 24.3 2D editor

Target responsive pointer interaction for normal residential project complexity. Debounce expensive analysis and avoid rerendering the entire scene for every drag event.

### 24.4 3D

Target fast initial scene load for MVP-scale houses. Lazy-load heavy viewer code and keep assets low-poly.

### 24.5 Large projects

The architecture must allow:

- derived render memoization
- selective 3D rebuilds
- lazy assets
- worker-based generation
- pagination for project/version history

### 24.6 Mobile devices

Responsive web support is required for core non-editor workflows. Very heavy 2D/3D interactions may expose reduced-detail or fallback behavior on constrained devices.

---

## 25. Deployment Architecture

### 25.1 Local development

Recommended local setup:

- Node.js processes for web/API
- Docker only for PostgreSQL and optional infrastructure dependencies
- `.env.local` style configuration

Docker is not required for every application process.

### 25.2 Staging

Staging should closely mirror production boundaries:

- separate database
- separate object-storage namespace
- separate AI credentials/project
- separate secrets
- production-like build pipeline

### 25.3 Production reference architecture

```text
CDN / Static Host
      │
      ▼
React Web App
      │ HTTPS
      ▼
Node/Express API
   ├── PostgreSQL
   ├── Object Storage
   └── AI Provider
```

Use a low-cost managed platform initially. The architecture remains vendor-neutral so infrastructure can later move without changing domain/application contracts.

### 25.4 Environment separation

At minimum:

- development
- staging
- production

Each environment has isolated credentials and data.

### 25.5 Configuration

Environment variables/configuration include:

- database connection
- authentication configuration
- AI provider configuration
- storage configuration
- allowed web origins
- cookie/session settings
- rate limits
- application environment

No secrets or environment-specific credentials are hard-coded.

---

## 26. Dependency Strategy

### React + Vite

**Responsibility:** interactive web application and development/build pipeline.

**Replaceable:** yes.

**Reason:** fits a highly interactive SPA with 2D/3D client workflows.

### Zustand

**Responsibility:** lightweight client application state.

**Replaceable:** yes.

**Rule:** do not place authoritative server state or business rules into the store.

### React Router

**Responsibility:** application routing and protected route composition.

**Replaceable:** yes.

### Express

**Responsibility:** HTTP API boundary.

**Replaceable:** yes.

**Rule:** controllers remain thin; use cases live in application services.

### Prisma + PostgreSQL

**Responsibility:** transactional persistence.

**Replaceable:** technically yes, but high migration cost.

**Reason:** PostgreSQL provides strong transactions and JSONB support suitable for canonical design snapshots; Prisma provides typed access and migrations.

### Zod

**Responsibility:** runtime schema validation at untrusted boundaries.

**Replaceable:** yes.

**Reason:** particularly important for AI output and HTTP input.

### Three.js / React Three Fiber

**Responsibility:** 3D visualization.

**Replaceable:** yes, but expensive.

**Rule:** isolated behind rendering adapters/components so domain code remains renderer-independent.

### SVG

**Responsibility:** initial 2D visualization/editor surface.

**Replaceable:** yes.

**Rule:** keep coordinate and geometry math independent from SVG so another renderer can be introduced without rewriting the domain.

### Gemini

**Responsibility:** natural-language interpretation / design-intent generation.

**Replaceable:** yes.

**Rule:** accessed only through `AIProvider`.

### Storage provider

**Responsibility:** binary object storage.

**Replaceable:** yes.

**Rule:** accessed only through `IStorageService`.

---

## 27. Architecture Decision Records

### ADR-001: React + Vite

**Decision:** React with Vite as the web application foundation.

**Reason:** the application is dominated by highly interactive project, editor, and 3D workflows. SEO is not the primary concern for authenticated product surfaces.

**Alternatives:** Next.js, Vue.

**Trade-offs:** less framework-provided SSR/SEO behavior; simpler SPA deployment and client-heavy architecture.

### ADR-002: Canonical House Design Model

**Decision:** one canonical design representation for 2D, analysis, 3D, walkthrough, export, and review.

**Reason:** prevents 2D/3D state divergence and creates one validation boundary.

**Alternatives:** separate synchronized 2D and 3D models.

**Trade-offs:** renderer-specific visual features must remain derived rather than becoming authoritative design state.

### ADR-003: PostgreSQL + Prisma

**Decision:** PostgreSQL with Prisma.

**Reason:** strong transactional guarantees plus JSONB support for evolving canonical design snapshots.

**Alternatives:** MongoDB, a fully normalized geometry schema.

**Trade-offs:** JSONB requires disciplined schema/version validation; highly relational analytics may require separate relational projections later.

### ADR-004: Deterministic Design Engine

**Decision:** build an internal deterministic, seeded multi-start layout engine for MVP.

**Reason:** keeps geometry behavior testable and avoids introducing a heavyweight solver before complexity is proven.

**Alternatives:** commercial solver, general constraint-programming framework, AI-generated geometry.

**Trade-offs:** the engine will initially support a narrower layout vocabulary and will require deliberate expansion as design complexity grows.

### ADR-005: Gemini Provider Abstraction

**Decision:** isolate Gemini behind an `AIProvider` interface.

**Reason:** prevents vendor lock-in and protects the domain from model-specific output formats.

**Alternatives:** direct Gemini SDK usage inside application services.

**Trade-offs:** small abstraction overhead.

### ADR-006: SVG for 2D MVP

**Decision:** SVG-based 2D rendering/editor.

**Reason:** conceptual residential plans have relatively low object counts and SVG provides direct event handling and predictable transforms.

**Alternatives:** Canvas, Konva, Fabric.js.

**Trade-offs:** performance must be profiled before supporting extremely large object counts.

### ADR-007: Three.js / React Three Fiber

**Decision:** Three.js with React Three Fiber for 3D.

**Reason:** mature WebGL ecosystem and strong React integration.

**Alternatives:** Babylon.js, custom WebGL renderer.

**Trade-offs:** browser GPU variability and asset/performance complexity.

### ADR-008: npm Workspaces Monorepo

**Decision:** start with npm workspaces.

**Reason:** shared domain/design-engine packages are required, but a task orchestrator is not necessary on day one.

**Alternatives:** Turborepo, pnpm workspaces, separate repositories.

**Trade-offs:** advanced task caching can be added later if CI/build performance warrants it.

### ADR-009: Immutable Design Versions

**Decision:** save complete canonical snapshots as immutable versions.

**Reason:** versions can be independently rendered, shared, restored, and exported without replaying a history of diffs.

**Alternatives:** event sourcing, diff-only snapshots.

**Trade-offs:** more storage per version; acceptable for conceptual residential designs and simpler operational behavior.

### ADR-010: Opaque Server-Side Share Tokens

**Decision:** client-review links use random opaque tokens stored hashed in the database.

**Reason:** revocation, scope checking, and auditability are simpler and safer than embedding access state in a self-contained bearer token.

**Alternatives:** JWT share tokens.

**Trade-offs:** every share-link request needs a database lookup; this is acceptable for the expected review workload and improves revocation control.

---

## 28. Implementation Sequence

Implementation follows the approved product priority and must not skip the domain foundation.

### Phase 1 — Foundations

1. Monorepo and workspace setup
2. TypeScript strict configuration
3. ESLint and Prettier
4. shared package configuration
5. application environment/config handling
6. testing foundations

### Phase 2 — Domain foundation

7. Canonical House Design Model
8. geometry primitives
9. validation/result types
10. constraints and preferences
11. design commands
12. serialization/schema-version strategy

### Phase 3 — Design engine

13. plot/buildable-area model
14. room placement
15. wall generation
16. adjacency/circulation
17. openings
18. deterministic validation
19. seeded multi-start concept generation
20. conflict reporting
21. plan analysis

### Phase 4 — Backend foundation

22. PostgreSQL/Prisma setup
23. tenant/workspace model
24. project persistence
25. active draft persistence
26. immutable version persistence
27. repository layer
28. application services
29. authentication/authorization
30. audit logging

### Phase 5 — AI integration

31. `AIProvider` contract
32. Gemini adapter
33. structured DesignIntent schema
34. validation/normalization pipeline
35. generation orchestration
36. provider failure handling
37. usage/rate controls

### Phase 6 — Product UI

38. application shell
39. authentication flows
40. projects dashboard
41. project setup
42. plot/site form
43. requirements form
44. AI design brief/review UI
45. concept selection/comparison
46. plan analysis UI

### Phase 7 — 2D editor

47. world/screen coordinate system
48. SVG renderer
49. selection/hover
50. snapping
51. editing commands
52. undo/redo
53. autosave
54. optimistic concurrency handling

### Phase 8 — 3D and walkthrough

55. canonical-to-3D derivation
56. walls/floors/openings
57. furniture
58. camera/navigation
59. collision handling
60. floor switching
61. fallback behavior

### Phase 9 — Collaboration and export

62. immutable version UI
63. compare/restore
64. share links
65. client review/comments/approval
66. PDF/JSON export
67. export validation and access control

### Phase 10 — Professional SaaS

68. team/company management
69. usage tracking
70. billing only after usage/billing requirements are explicitly promoted into scope
71. operational dashboards and broader observability

---

## 29. Architecture Invariants

The following rules are non-negotiable engineering invariants:

1. The House Design Model is the only authoritative design state.
2. AI output never becomes authoritative without validation.
3. Hard constraints cannot be bypassed for convenience.
4. Every tenant-owned request is server-authorized.
5. Saved design versions are immutable.
6. Client review links never gain broader access than explicitly granted.
7. 2D and 3D are projections of canonical state.
8. Prisma/database records are not exposed directly as API contracts.
9. Domain and design-engine code must remain independent of React, Express, and Prisma.
10. No new major dependency is added without documenting its responsibility and trade-off.
11. Generation must be reproducible from normalized input, configuration, engine version, and seed.
12. Security-sensitive failures fail closed rather than falling back to permissive behavior.

---

## 30. Architecture Open Questions

These items are intentionally unresolved and should be answered before the relevant implementation reaches production maturity.

### 30.1 Identity provider

Which authentication provider or first-party identity implementation will be selected? The application architecture keeps this behind an authentication boundary so the choice does not leak into the domain.

### 30.2 Share-link policy

What default expiration periods and project-level scope options should be exposed to users? The security architecture already supports revocation and expiration independently of the final product policy.

### 30.3 MVP wall topology

Exactly which T-junction, cross-junction, wall-thickness, and opening rules are included in MVP must be fixed in `docs/03-domain-model.md` and `docs/05-design-engine.md` before implementation begins.

### 30.4 Curved/non-orthogonal walls

Confirm whether curved or non-orthogonal walls are explicitly out of MVP. If introduced later, they must be added to the canonical geometry model rather than implemented as renderer-only exceptions.

### 30.5 Concept minimum

Define the minimum number of valid concepts that must be produced when the requested target of five cannot be satisfied. The engine must report the actual result rather than fabricate concepts.

### 30.6 Generation execution model

Start the engine in the API process for simple workloads. Move it to worker execution only after measured runtime/blocking justifies the operational complexity.

### 30.7 Rendering threshold

SVG is the default. Establish an empirical object-count/performance threshold before introducing canvas/Konva/Fabric or renderer virtualization.

### 30.8 Storage provider

Select the lowest-cost compliant object-storage provider for the deployment region and expected file volume. The application remains vendor-neutral through `IStorageService`.

### 30.9 Advanced site/environment analysis

Define the conditions under which advanced sunlight, environmental, or site-intelligence analysis graduates from future scope into implementation scope.

---

## 31. Final Architecture Review Checklist

Before implementation begins, confirm:

- [ ] `docs/00-product-vision.md` is aligned
- [ ] `docs/01-requirements.md` is aligned
- [ ] `docs/03-domain-model.md` defines the exact canonical schema
- [ ] `docs/04-api-contracts.md` defines request/response contracts
- [ ] `docs/05-design-engine.md` defines the deterministic generation algorithm and invariants
- [ ] `docs/06-testing-strategy.md` defines fixture and regression strategy
- [ ] `docs/07-security-model.md` defines authorization and threat controls
- [ ] `docs/08-roadmap.md` defines milestone sequencing
- [ ] no implementation code has been added before architecture approval
- [ ] no unresolved open question blocks the first implementation milestone

---

## 32. Architectural Summary

The AI Home Designer is structured as a modular TypeScript monorepo centered on one canonical `HouseDesign` model.

AI interprets language into validated `DesignIntent`. A deterministic design engine converts that intent into valid candidate layouts. The same canonical design state drives plan analysis, the SVG editor, 3D visualization, walkthrough, versioning, client review, and export.

The architecture intentionally starts as a small number of deployable components with strong internal boundaries. PostgreSQL provides transactional persistence and JSONB snapshots provide a practical representation for evolving design geometry. Tenant isolation, version immutability, server-side authorization, and untrusted-input validation are treated as core architecture concerns rather than later hardening tasks.

The result is a foundation that is practical for MVP development while preserving clear extension points for richer geometry, background generation, advanced environmental analysis, collaboration, usage tracking, and future professional SaaS capabilities.
