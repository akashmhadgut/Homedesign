# API Contracts Document

## 1. Purpose

This document defines the versioned HTTP API contract for the AI Home Designer.

It translates the approved product requirements, system architecture, and domain model into stable external interfaces for:

- the web application
- the deterministic design engine/application services
- AI-assisted design intent generation
- project and workspace management
- the 2D editor
- design versioning
- 3D/walkthrough data retrieval
- client review
- file/asset handling
- export
- usage tracking

The API is an application boundary, not a direct database API. Prisma models, database relations, provider SDK types, and internal domain objects must not be exposed directly as public response contracts.

---

## 2. Contract Principles

### 2.1 Versioning

All application routes are versioned under:

`/v1`

Breaking changes require a new API version. Additive fields and additive endpoints are permitted within a version when backward compatible.

### 2.2 JSON

Requests and responses use JSON by default.

Content type:

`application/json`

Binary upload/download operations use the content type appropriate to the uploaded asset or generated file and are described separately in the file-storage section.

### 2.3 Server authority

The client is untrusted.

The API must perform server-side checks for:

- authentication
- workspace membership
- project ownership/access
- resource ownership
- role permissions
- version access
- share-link scope
- asset access
- usage limits

Frontend route guards are not security controls.

### 2.4 Domain authority

API mutations map to explicit application/domain commands.

The API must not expose arbitrary operations such as:

- `PATCH /house-design` with unrestricted nested geometry
- direct SQL updates from controllers
- raw Prisma model mutation from controllers

Geometry changes must pass through domain validation and deterministic invariants.

### 2.5 Idempotency

The following mutation classes support an `Idempotency-Key` header:

- concept-generation creation
- export creation
- version creation
- share-link creation
- asset upload-session creation
- operations that may trigger billable/limited AI usage

The server stores the result for the idempotency window and returns the original result for repeated requests using the same key and request fingerprint.

### 2.6 Optimistic concurrency

Active-draft mutations use optimistic concurrency.

Preferred mechanism:

`If-Match: <draftRevision>`

or an equivalent explicit `baseRevision` request field when the request body already represents a command envelope.

A stale revision returns `409 CONFLICT` and includes the current revision metadata needed for the client to refresh/reconcile.

### 2.7 Pagination

Collection endpoints use cursor pagination where practical.

Query parameters:

- `limit` — default `20`, maximum `100`
- `cursor` — opaque continuation cursor

Response metadata:

```json
{
  "nextCursor": "opaque-cursor-or-null"
}
```

Clients must not construct or interpret cursor contents.

### 2.8 Dates and timestamps

All timestamps use ISO 8601 UTC strings.

Example:

`2026-09-18T10:30:00Z`

### 2.9 Numeric units

Canonical design geometry is represented in millimetres as defined by the domain model. User-facing display units are presentation concerns.

### 2.10 Request tracing

Clients may send:

`X-Request-Id: <opaque-id>`

The server generates one when absent and returns the request ID in the response header and error body metadata.

---

## 3. Authentication Contract

### 3.1 Authentication model

Authenticated application requests use:

`Authorization: Bearer <access-token>`

The concrete identity provider or token implementation remains replaceable behind the authentication infrastructure boundary.

Refresh/session handling must use secure server-managed mechanisms and must not expose long-lived credentials to browser JavaScript.

### 3.2 Endpoints

#### `POST /v1/auth/login`

Authenticate a user.

Request:

```json
{
  "email": "user@example.com",
  "password": "redacted"
}
```

Response `200`:

```json
{
  "data": {
    "user": {
      "id": "usr_...",
      "email": "user@example.com",
      "name": "Example User"
    },
    "accessToken": "short-lived-token"
  }
}
```

Exact credential handling may later be delegated to an external identity provider without changing resource contracts.

#### `POST /v1/auth/refresh`

Refresh an authenticated session using the secure refresh/session mechanism.

#### `POST /v1/auth/logout`

Invalidate the active session/refresh credential.

#### `GET /v1/me`

Return the authenticated user and accessible workspace context.

Response:

```json
{
  "data": {
    "user": {
      "id": "usr_...",
      "email": "user@example.com",
      "name": "Example User"
    },
    "workspaces": [
      {
        "id": "wsp_...",
        "name": "My Workspace",
        "role": "ADMIN"
      }
    ]
  }
}
```

---

## 4. Workspace and Team Contracts

### 4.1 `GET /v1/workspaces`

List workspaces accessible by the authenticated user.

### 4.2 `POST /v1/workspaces`

Create a personal or company workspace.

Request:

```json
{
  "name": "ABC Builders",
  "type": "COMPANY"
}
```

Supported MVP types:

- `PERSONAL`
- `COMPANY`

### 4.3 `GET /v1/workspaces/{workspaceId}`

Return workspace metadata visible to the requesting member.

### 4.4 `GET /v1/workspaces/{workspaceId}/members`

List members with cursor pagination.

### 4.5 `POST /v1/workspaces/{workspaceId}/members`

Invite or add a member according to the selected authentication/invitation implementation.

Request:

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

### 4.6 `PATCH /v1/workspaces/{workspaceId}/members/{userId}`

Update a member role. Only authorized workspace administrators may perform this operation.

### 4.7 `DELETE /v1/workspaces/{workspaceId}/members/{userId}`

Remove a member from a company workspace. Destructive membership actions must be audited.

---

## 5. Project Contracts

### 5.1 `POST /v1/workspaces/{workspaceId}/projects`

Create a project.

Request:

```json
{
  "name": "Mhadgut Residence",
  "description": "Concept planning for a new home"
}
```

Response `201`:

```json
{
  "data": {
    "id": "prj_...",
    "workspaceId": "wsp_...",
    "name": "Mhadgut Residence",
    "description": "Concept planning for a new home",
    "status": "DRAFT",
    "createdAt": "2026-09-18T10:30:00Z",
    "updatedAt": "2026-09-18T10:30:00Z"
  }
}
```

### 5.2 `GET /v1/workspaces/{workspaceId}/projects`

List projects accessible to the requesting user.

Supported filters may include:

- `status`
- `search`
- `updatedAfter`

Pagination is required.

### 5.3 `GET /v1/projects/{projectId}`

Return project summary and current design state metadata.

### 5.4 `PATCH /v1/projects/{projectId}`

Update project metadata.

Allowed fields:

- `name`
- `description`

### 5.5 `POST /v1/projects/{projectId}:archive`

Archive a project instead of immediately hard-deleting it.

Archival is auditable and does not invalidate previously saved immutable versions unless explicitly required by a future retention policy.

---

## 6. Plot and Site Contracts

### 6.1 `PUT /v1/projects/{projectId}/plot`

Create or replace the project plot definition.

Request shape follows domain DTOs and includes:

- boundary geometry
- dimensions
- coordinate origin
- plot orientation
- source/measurement metadata

The server validates geometry and ownership before persistence.

### 6.2 `GET /v1/projects/{projectId}/plot`

Return the canonical plot.

### 6.3 `PUT /v1/projects/{projectId}/site`

Create or replace site context.

May include:

- access direction
- road information
- north orientation
- setbacks
- observations
- site-intelligence metadata
- site asset references

### 6.4 `GET /v1/projects/{projectId}/site`

Return canonical site context.

### 6.5 Plot/site validation

Plot and site mutations return deterministic validation findings when information is incomplete or geometrically invalid.

Example:

```json
{
  "data": null,
  "error": {
    "code": "PLOT_INVALID",
    "message": "Plot boundary must form a valid closed polygon.",
    "details": {
      "field": "boundary",
      "reason": "SELF_INTERSECTION"
    },
    "requestId": "req_..."
  }
}
```

---

## 7. Requirement Contracts

### 7.1 `GET /v1/projects/{projectId}/requirements`

Return normalized project requirements.

### 7.2 `PUT /v1/projects/{projectId}/requirements`

Create or replace the requirement set.

Request:

```json
{
  "familySize": 4,
  "floors": 2,
  "bedrooms": 3,
  "bathrooms": 3,
  "parking": 1,
  "specialRooms": ["PUJA"],
  "futureExpansion": true,
  "notes": "Need good natural light"
}
```

The exact domain schema is defined by the domain model and must be validated before persistence.

### 7.3 Requirement source metadata

The API may preserve source information such as:

- user-entered
- AI-interpreted
- imported
- system-generated

AI-derived interpretations remain reviewable and must not automatically become geometry.

---

## 8. AI Design Brief Contracts

### 8.1 `POST /v1/projects/{projectId}/ai/design-brief`

Generate a structured design brief from the current project inputs.

Request:

```json
{
  "input": "3 bedroom house for a family of four with one car and future expansion"
}
```

Response `200`:

```json
{
  "data": {
    "designIntent": {
      "schemaVersion": 1,
      "rooms": [],
      "constraints": [],
      "preferences": []
    },
    "warnings": [],
    "requiresConfirmation": true
  }
}
```

The response is a proposed structured interpretation, not an authoritative HouseDesign.

### 8.2 `POST /v1/projects/{projectId}/design-intent:confirm`

Persist the reviewed/confirmed design intent.

The server must revalidate the payload independently of the AI response.

### 8.3 AI output rules

AI-generated values are treated as untrusted input until:

1. schema validation passes
2. normalization succeeds
3. business validation succeeds
4. domain validation succeeds

The API must never expose a route allowing an AI response to bypass these stages.

---

## 9. Design Preference and Constraint Contracts

### 9.1 `GET /v1/projects/{projectId}/preferences`

Return current user-configured design preferences.

### 9.2 `PUT /v1/projects/{projectId}/preferences`

Update preference configuration.

Preferences may include:

- Vastu preferences
- sunlight preferences
- privacy preferences
- room adjacency preferences
- future expansion preferences

Vastu values represent configurable traditional preferences and must not be returned as scientific guarantees.

### 9.3 `GET /v1/projects/{projectId}/constraints`

Return normalized hard and soft constraints used by the design engine.

### 9.4 `PUT /v1/projects/{projectId}/constraints`

Update explicit constraints when allowed by the current project state.

Hard constraints must remain distinguishable from soft preferences in both request and response contracts.

---

## 10. Concept Generation Contracts

### 10.1 `POST /v1/projects/{projectId}/concept-generations`

Start a concept-generation operation.

Request:

```json
{
  "count": 5,
  "seed": 123456,
  "includeAnalysis": false
}
```

Rules:

- `count` is capped at `5` for the initial product contract.
- The server may return fewer concepts when the validated requirements cannot produce the requested number of acceptable distinct concepts.
- `seed` is optional and is primarily useful for reproducibility/testing.
- generation uses the confirmed DesignIntent and validated plot/site/constraint state.

Response `202`:

```json
{
  "data": {
    "generationId": "gen_...",
    "status": "QUEUED"
  }
}
```

The implementation may initially execute this job inside the API process, but the contract remains job-oriented so a worker can be introduced later without changing the client contract.

### 10.2 `GET /v1/projects/{projectId}/concept-generations/{generationId}`

Return generation status.

Statuses:

- `QUEUED`
- `RUNNING`
- `COMPLETED`
- `PARTIAL`
- `FAILED`
- `CANCELLED`

Completed response:

```json
{
  "data": {
    "generationId": "gen_...",
    "status": "COMPLETED",
    "concepts": [
      {
        "id": "concept_...",
        "ordinal": 1,
        "conceptLabel": "Concept 1",
        "scoreSummary": {
          "hardConstraintsValid": true,
          "softPreferenceFindings": 3
        }
      }
    ],
    "warnings": []
  }
}
```

### 10.3 `GET /v1/projects/{projectId}/concepts`

List generated concepts for the current project.

### 10.4 `GET /v1/projects/{projectId}/concepts/{conceptId}`

Return the complete concept payload required for review and comparison.

### 10.5 `POST /v1/projects/{projectId}/concepts/{conceptId}:activate`

Make a selected concept the active editable draft.

Activation creates or replaces the active draft through a validated domain operation. It does not mutate the original generated concept snapshot.

---

## 11. Plan Analysis Contracts

### 11.1 `POST /v1/projects/{projectId}/analyses`

Run deterministic plan analysis for the selected design state.

Request:

```json
{
  "source": {
    "type": "ACTIVE_DRAFT"
  }
}
```

Alternative source:

```json
{
  "source": {
    "type": "DESIGN_VERSION",
    "designVersionId": "ver_..."
  }
}
```

Response:

```json
{
  "data": {
    "analysisId": "analysis_...",
    "designRevision": 14,
    "findings": [
      {
        "code": "ROOM_TOO_SMALL",
        "severity": "WARNING",
        "entityId": "room_...",
        "message": "Bedroom is below the configured preferred area."
      }
    ],
    "summary": {
      "errors": 0,
      "warnings": 1,
      "info": 2
    }
  }
}
```

Analysis is derived data. It does not become authoritative design state.

---

## 12. Active Design and 2D Editor Contracts

### 12.1 `GET /v1/projects/{projectId}/design`

Return the active draft and its revision metadata.

Response includes:

- `houseDesign`
- `draftRevision`
- `updatedAt`
- `lastSavedAt`

### 12.2 `POST /v1/projects/{projectId}/design/commands`

Apply one or more domain commands to the active draft.

Request:

```json
{
  "baseRevision": 14,
  "commands": [
    {
      "type": "MOVE_WALL",
      "wallId": "wall_123",
      "delta": {
        "xMm": 120,
        "yMm": 0
      }
    }
  ]
}
```

Processing order:

1. authenticate
2. authorize project access
3. verify `baseRevision`
4. validate command DTO
5. execute domain command
6. validate resulting HouseDesign
7. persist active draft atomically
8. increment revision
9. return the accepted canonical state/patch metadata

Response `200`:

```json
{
  "data": {
    "draftRevision": 15,
    "houseDesign": {},
    "appliedCommands": ["MOVE_WALL"],
    "validationWarnings": []
  }
}
```

### 12.3 Invalid command behavior

Invalid commands fail atomically.

No partially applied geometry is persisted.

Example error codes include:

- `INVALID_COMMAND`
- `DESIGN_REVISION_CONFLICT`
- `GEOMETRY_OUT_OF_BOUNDS`
- `ROOM_OVERLAP`
- `INVALID_WALL_TOPOLOGY`
- `INVALID_OPENING_POSITION`
- `INVALID_STAIRCASE`

### 12.4 Undo/redo

Undo/redo is primarily an editor interaction concern using the client's command/snapshot history.

A valid undo results in a new canonical mutation and therefore follows the same server validation and concurrency rules as any other design change.

---

## 13. Design Version Contracts

### 13.1 `POST /v1/projects/{projectId}/design-versions`

Create an immutable saved snapshot of the current active draft.

Request:

```json
{
  "name": "Client Review V1",
  "note": "Initial three-bedroom concept"
}
```

Response `201`:

```json
{
  "data": {
    "id": "ver_...",
    "projectId": "prj_...",
    "versionNumber": 3,
    "name": "Client Review V1",
    "note": "Initial three-bedroom concept",
    "draftRevision": 15,
    "createdAt": "2026-09-18T11:00:00Z"
  }
}
```

### 13.2 `GET /v1/projects/{projectId}/design-versions`

List immutable versions.

### 13.3 `GET /v1/projects/{projectId}/design-versions/{versionId}`

Return a complete immutable snapshot.

### 13.4 `POST /v1/projects/{projectId}/design-versions/{versionId}:restore`

Restore a saved version into the active draft.

The immutable version is not modified. Restoration creates a new mutable draft revision.

### 13.5 `POST /v1/projects/{projectId}/design-versions/compare`

Compare two immutable versions.

Request:

```json
{
  "leftVersionId": "ver_1",
  "rightVersionId": "ver_2"
}
```

Response contains derived differences such as:

- added/removed rooms
- changed dimensions
- changed openings
- changed constraints/findings

Comparison output is derived and does not become authoritative design state.

---

## 14. 3D and Walkthrough Contracts

### 14.1 `GET /v1/projects/{projectId}/design/3d`

Return the canonical design data needed by the 3D client.

This endpoint may expose a view-optimized projection, but the projection must be reconstructible from the canonical HouseDesign.

### 14.2 `GET /v1/projects/{projectId}/design/walkthrough`

Return derived walkthrough/navigation data.

Possible response sections:

- floors
- walkable regions
- spawn points
- navigation portals
- collision primitives

These are derived representations and are never persisted as an alternative design authority.

### 14.3 3D edit restrictions

The walkthrough/3D API must not accept authoritative geometry edits.

Any geometry change is performed through the active-design/domain command API.

---

## 15. Client Review Contracts

Client review is intentionally separate from normal authenticated application access.

### 15.1 `POST /v1/projects/{projectId}/client-reviews`

Create a review session for a specific immutable DesignVersion.

Request:

```json
{
  "designVersionId": "ver_...",
  "permissions": ["READ", "COMMENT", "APPROVE"],
  "expiresAt": "2026-10-01T23:59:59Z"
}
```

### 15.2 `POST /v1/client-reviews/{reviewId}/share-links`

Create a scoped share credential.

The server returns the raw token only at creation time.

The database stores a secure hash or equivalent revocation-safe representation, not the reusable raw token.

### 15.3 `DELETE /v1/client-reviews/{reviewId}/share-links/{shareLinkId}`

Revoke a share link.

### 15.4 Public review bootstrap

`GET /v1/review/{shareToken}`

Returns only the allowed review payload for the token's scope.

### 15.5 Public review comments

`POST /v1/review/{shareToken}/comments`

Request:

```json
{
  "body": "Please move the kitchen entrance."
}
```

### 15.6 Public review approval

`POST /v1/review/{shareToken}/approval`

Request:

```json
{
  "decision": "APPROVED",
  "comment": "Approved for next iteration."
}
```

The server verifies the token scope, expiry, revocation state, and target `DesignVersion` before processing.

---

## 16. File and Asset Contracts

### 16.1 `POST /v1/projects/{projectId}/assets/upload-sessions`

Create a controlled upload session.

Request:

```json
{
  "fileName": "site-photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 2450000,
  "purpose": "SITE_IMAGE"
}
```

Response contains:

- asset ID
- upload URL or upload instructions
- expiration
- required headers

The API validates allowed types and configured size limits before issuing an upload authorization.

### 16.2 `POST /v1/projects/{projectId}/assets/{assetId}:complete`

Finalize the upload and perform server-side metadata validation.

Where infrastructure supports it, asynchronous malware scanning may be inserted before the asset becomes generally accessible.

### 16.3 `GET /v1/projects/{projectId}/assets`

List accessible assets.

### 16.4 `DELETE /v1/projects/{projectId}/assets/{assetId}`

Soft-delete/unlink an asset according to retention policy. Physical storage deletion may be asynchronous.

### 16.5 Asset access

Private assets are never exposed through permanent public URLs.

Download/view access uses short-lived authorization or signed access generated by the storage abstraction.

---

## 17. Export Contracts

### 17.1 `POST /v1/projects/{projectId}/exports`

Create an export job for a selected immutable version or active draft.

Request:

```json
{
  "source": {
    "type": "DESIGN_VERSION",
    "designVersionId": "ver_..."
  },
  "formats": ["PDF", "JSON"]
}
```

MVP supported formats:

- `PDF`
- `JSON`

DXF remains a future extension and must not be presented as an MVP capability.

Response `202`:

```json
{
  "data": {
    "exportId": "exp_...",
    "status": "QUEUED"
  }
}
```

### 17.2 `GET /v1/projects/{projectId}/exports/{exportId}`

Return export status and, when complete, short-lived download references.

Statuses:

- `QUEUED`
- `RUNNING`
- `COMPLETED`
- `FAILED`

The exported design must correspond to a clearly identified source revision/version.

---

## 18. Usage Contracts

### 18.1 `GET /v1/workspaces/{workspaceId}/usage`

Return current usage counters relevant to the product's configured limits.

Possible counters:

- AI requests
- concept generations
- generated concepts
- exports
- stored assets

Billing/payment APIs are outside the initial MVP contract.

### 18.2 Usage consistency

Usage accounting must occur server-side after successful authorization and according to operation semantics.

Retrying an idempotent operation must not double-count the same billable/limited operation.

---

## 19. Common Response Envelope

Successful single-resource response:

```json
{
  "data": {}
}
```

Successful collection response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": null
  }
}
```

Successful mutation may additionally return:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_..."
  }
}
```

Clients should not depend on undocumented top-level fields.

---

## 20. Common Error Contract

All expected API errors use a stable machine-readable error code.

Example:

```json
{
  "error": {
    "code": "DESIGN_REVISION_CONFLICT",
    "message": "The active design changed since this operation was started.",
    "details": {
      "expectedRevision": 14,
      "currentRevision": 15
    },
    "requestId": "req_..."
  }
}
```

### 20.1 Standard HTTP mappings

| Status | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| 400    | Malformed request or invalid command shape                 |
| 401    | Missing or invalid authentication                          |
| 403    | Authenticated but not authorized                           |
| 404    | Resource not visible or does not exist                     |
| 409    | Concurrency conflict or domain state conflict              |
| 413    | Payload/file too large                                     |
| 415    | Unsupported media type                                     |
| 422    | Well-formed request rejected by domain/business validation |
| 429    | Rate/usage limit exceeded                                  |
| 500    | Unexpected internal failure                                |
| 503    | Temporarily unavailable dependency/service                 |

For security-sensitive resources, `404` may be returned instead of `403` when revealing the resource's existence would create an information disclosure risk.

---

## 21. Authorization Contract

### 21.1 Server-side policy

Every protected route resolves authorization from the authenticated principal and the target resource.

The minimum check sequence is:

1. authenticate principal
2. resolve workspace/tenant
3. resolve resource through tenant-scoped query
4. verify role and resource permission
5. execute application service

### 21.2 Resource policy examples

| Operation                | Admin           | Member                           | Client Review Token   |
| ------------------------ | --------------- | -------------------------------- | --------------------- |
| Read project             | Yes             | Yes if assigned/allowed          | Only scoped version   |
| Edit project metadata    | Yes             | Allowed by project policy        | No                    |
| Edit active design       | Yes             | Yes if project permission allows | No                    |
| Save version             | Yes             | Yes if project permission allows | No                    |
| Create share link        | Yes             | Policy-controlled                | No                    |
| Comment on client review | No token needed | No token needed                  | Yes when scope allows |
| Approve client review    | No token needed | No token needed                  | Yes when scope allows |
| Manage members           | Yes             | No                               | No                    |

These are server policies, not frontend visibility rules.

---

## 22. Transaction Boundaries

### 22.1 Design command transaction

Applying a design command must be atomic for the active draft:

- load current state
- verify revision
- apply command(s)
- validate invariants
- persist new state and revision

No partially valid geometry may be committed.

### 22.2 Version transaction

Creating a DesignVersion captures a consistent snapshot of the active draft and relevant domain metadata in one logical transaction.

### 22.3 Share-link transaction

Creating a share link must atomically persist its scope, expiry, revocation state, and secure token representation.

### 22.4 Usage transaction

Usage updates and idempotency records must be coordinated so retries do not create inconsistent counts.

---

## 23. API Layering

Routes follow:

`Router → Authentication/Authorization Middleware → Controller → Application Service → Domain / Repository / Infrastructure Ports`

### Router

Defines route paths, methods, middleware, and request parsing configuration.

### Controller

Responsible only for:

- request DTO parsing
- invoking application services
- mapping application results to HTTP responses

### Application Service

Responsible for:

- use-case orchestration
- authorization checks that belong to application policy
- transactions
- calling domain commands
- invoking AI/storage/export infrastructure ports

### Domain

Responsible for:

- entities
- value objects
- invariants
- commands
- domain validation
- deterministic geometry rules

### Repository

Responsible for persistence translation only.

Prisma-specific structures remain inside repository/infrastructure implementations.

---

## 24. Validation Boundaries

Validation is intentionally layered.

### Boundary 1: Transport validation

Validate JSON shape, types, required fields, length, enum values, and basic limits.

### Boundary 2: Application validation

Validate authorization context, resource relationships, workflow state, and operation permissions.

### Boundary 3: Domain validation

Validate geometry, invariants, constraints, versioning rules, and canonical model correctness.

### Boundary 4: Infrastructure validation

Validate provider/storage constraints before interacting with external systems.

The same externally supplied value must never be trusted merely because an earlier layer accepted it.

---

## 25. Rate Limiting and Abuse Controls

Rate limiting is required at minimum for:

- login
- AI design-brief generation
- concept generation
- client review comments/approval
- asset upload session creation
- export creation

Limits should be keyed using a combination of authenticated principal, workspace where appropriate, and operation type.

AI and concept-generation limits should integrate with server-side usage tracking.

---

## 26. Security Requirements for API Implementations

The API implementation must:

1. never trust client-supplied `tenantId` as proof of access
2. never authorize by object ID alone
3. use tenant-scoped repository queries
4. validate every route body/query/path parameter
5. reject unknown dangerous fields where schema strictness is appropriate
6. avoid logging passwords, tokens, share secrets, or sensitive uploaded content
7. return generic authentication errors where detailed responses would aid credential attacks
8. avoid exposing Prisma/database errors directly
9. rotate/revoke sessions according to the selected authentication implementation
10. hash or securely protect reusable share credentials
11. expire share credentials
12. enforce file upload limits before resource allocation where practical
13. treat AI output as untrusted input
14. never execute model-generated code
15. record security-sensitive actions in audit logs

---

## 27. Audit Events

The following events should create audit entries where applicable:

- login/security events
- workspace membership changes
- project creation/archive
- requirement/design-intent confirmation
- concept generation
- active design mutations of consequence
- version creation
- version restore
- client review creation
- share-link creation/revocation
- client approval
- asset deletion
- export creation

Audit records should include:

- actor ID where available
- workspace ID
- project ID when relevant
- action type
- target type/ID
- timestamp
- request ID
- outcome

Sensitive payloads should not be copied into audit logs unnecessarily.

---

## 28. API Testing Contract

Every endpoint class must have tests for:

### Authentication

- unauthenticated request rejected
- expired/invalid credential rejected
- authenticated request accepted when valid

### Authorization

- same-workspace authorized access
- cross-workspace access rejected
- role-restricted operations rejected
- share-link scope enforced

### Validation

- malformed DTO rejected
- invalid enum rejected
- oversize request rejected
- domain-invalid command rejected

### Concurrency

- stale design revision returns `409`
- no partial mutation occurs

### Idempotency

- identical retry returns the original result
- conflicting reuse of an idempotency key is rejected

### Domain integration

- accepted editor command changes canonical state correctly
- invalid geometry never reaches persistence
- saved versions remain immutable

### Critical E2E

At minimum:

`login → create project → plot/site → requirements → AI brief → confirm intent → generate concepts → activate concept → edit 2D → save version → open 3D → create review → client comment/approval → export`

---

## 29. Contract Evolution Rules

1. Do not expose Prisma-generated schema directly.
2. Do not rename or change the semantics of stable fields within `v1` without a compatibility plan.
3. Additive response fields must be safely ignorable by older clients.
4. Request fields may become required only in a new major API version or through a separately versioned operation contract.
5. Domain schema version and API version are separate concerns.
6. HouseDesign serialization includes its own schema version so persisted versions can be migrated independently of HTTP route versions.

---

## 30. API Documentation and Source of Truth

The final API implementation must be backed by machine-readable schemas generated from the same contract definitions used for validation.

Recommended approach:

- TypeScript DTOs/types for compile-time development
- runtime schemas for untrusted input
- generated OpenAPI documentation from the API contract layer

OpenAPI is documentation/contract generation infrastructure. It must not replace domain validation.

---

## 31. MVP Endpoint Summary

### Authentication

- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/me`

### Workspaces

- `GET /v1/workspaces`
- `POST /v1/workspaces`
- `GET /v1/workspaces/{workspaceId}`
- `GET /v1/workspaces/{workspaceId}/members`
- `POST /v1/workspaces/{workspaceId}/members`
- `PATCH /v1/workspaces/{workspaceId}/members/{userId}`
- `DELETE /v1/workspaces/{workspaceId}/members/{userId}`

### Projects

- `POST /v1/workspaces/{workspaceId}/projects`
- `GET /v1/workspaces/{workspaceId}/projects`
- `GET /v1/projects/{projectId}`
- `PATCH /v1/projects/{projectId}`
- `POST /v1/projects/{projectId}:archive`

### Plot/Site

- `GET /v1/projects/{projectId}/plot`
- `PUT /v1/projects/{projectId}/plot`
- `GET /v1/projects/{projectId}/site`
- `PUT /v1/projects/{projectId}/site`

### Requirements/AI/Preferences

- `GET /v1/projects/{projectId}/requirements`
- `PUT /v1/projects/{projectId}/requirements`
- `POST /v1/projects/{projectId}/ai/design-brief`
- `POST /v1/projects/{projectId}/design-intent:confirm`
- `GET /v1/projects/{projectId}/preferences`
- `PUT /v1/projects/{projectId}/preferences`
- `GET /v1/projects/{projectId}/constraints`
- `PUT /v1/projects/{projectId}/constraints`

### Concepts/Analysis/Design

- `POST /v1/projects/{projectId}/concept-generations`
- `GET /v1/projects/{projectId}/concept-generations/{generationId}`
- `GET /v1/projects/{projectId}/concepts`
- `GET /v1/projects/{projectId}/concepts/{conceptId}`
- `POST /v1/projects/{projectId}/concepts/{conceptId}:activate`
- `POST /v1/projects/{projectId}/analyses`
- `GET /v1/projects/{projectId}/design`
- `POST /v1/projects/{projectId}/design/commands`

### Versions

- `POST /v1/projects/{projectId}/design-versions`
- `GET /v1/projects/{projectId}/design-versions`
- `GET /v1/projects/{projectId}/design-versions/{versionId}`
- `POST /v1/projects/{projectId}/design-versions/{versionId}:restore`
- `POST /v1/projects/{projectId}/design-versions/compare`

### 3D/Walkthrough

- `GET /v1/projects/{projectId}/design/3d`
- `GET /v1/projects/{projectId}/design/walkthrough`

### Client Review

- `POST /v1/projects/{projectId}/client-reviews`
- `POST /v1/client-reviews/{reviewId}/share-links`
- `DELETE /v1/client-reviews/{reviewId}/share-links/{shareLinkId}`
- `GET /v1/review/{shareToken}`
- `POST /v1/review/{shareToken}/comments`
- `POST /v1/review/{shareToken}/approval`

### Assets/Exports/Usage

- `POST /v1/projects/{projectId}/assets/upload-sessions`
- `POST /v1/projects/{projectId}/assets/{assetId}:complete`
- `GET /v1/projects/{projectId}/assets`
- `DELETE /v1/projects/{projectId}/assets/{assetId}`
- `POST /v1/projects/{projectId}/exports`
- `GET /v1/projects/{projectId}/exports/{exportId}`
- `GET /v1/workspaces/{workspaceId}/usage`

---

## 32. Deliberate Non-Goals for the API

The MVP API will not expose authoritative endpoints for:

- structural engineering calculations
- legal survey certification
- statutory building approval workflows
- construction cost estimation as a certified quantity system
- payment/billing provider integration
- DXF export
- arbitrary AI-generated code execution
- direct editing of a 3D scene as an independent model

These may be considered later without changing the canonical design authority principle.

---

## 33. API Open Questions

1. Final identity provider/custom authentication implementation remains an infrastructure decision, but the HTTP resource contracts above must remain stable.
2. Final worker/queue infrastructure for concept generation and exports should be selected only after implementation profiling; the job-based API contract intentionally avoids coupling clients to the execution mechanism.
3. The final OpenAPI generation approach and schema library should be selected consistently across the API codebase.
4. The exact workspace invitation workflow depends on the selected authentication/email implementation.
5. Storage provider selection remains outside the resource contract through `IStorageService`.

These questions must not block implementation of the domain model or initial API contract types because their interfaces are intentionally provider-neutral.

---

## 34. Implementation Boundary

This document defines HTTP/API behavior only.

The next implementation document should define the detailed API DTO/type schemas and validation contracts without bypassing the domain model.

The implementation order remains:

1. Domain/value-object schemas
2. Repository interfaces
3. Application services/use cases
4. Runtime request/response schemas
5. Route/controller wiring
6. API integration tests
7. OpenAPI generation
8. Frontend API client integration

The API must remain a thin application boundary over the canonical domain model rather than becoming a second business-logic layer.
