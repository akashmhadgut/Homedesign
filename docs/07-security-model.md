# Security Model Document

## 1. Purpose

This document defines the security architecture for the AI Home Designer.

The product handles residential design data, project information, uploaded site material, AI-generated design intent, private company workspaces, client review links, exported documents, and usage information. Security therefore protects not only user accounts, but also the integrity and confidentiality of the canonical House Design Model.

The primary security objective is:

> No unauthenticated, unauthorized, unvalidated, cross-tenant, or untrusted input may become authoritative application state.

This document is aligned with:

- `docs/00-product-vision.md`
- `docs/01-requirements.md`
- `docs/02-architecture.md`
- `docs/03-domain-model.md`
- `docs/04-api-contracts.md`
- `docs/05-design-engine.md`
- `docs/06-testing-strategy.md`

Security controls must be implemented server-side. Frontend checks improve user experience but are never treated as an authorization boundary.

---

## 2. Security Principles

### 2.1 Least privilege

Every user, role, token, API operation, service, and storage credential receives only the permissions necessary for its responsibility.

### 2.2 Server-side authorization

The backend independently verifies authentication, tenant membership, project access, role permissions, resource ownership, and client-review scope.

### 2.3 Zero trust for external input

All input from browsers, uploaded files, AI providers, third-party APIs, and client-review links is treated as untrusted until validated.

### 2.4 Canonical-state protection

The House Design Model is authoritative. Every path that creates or mutates canonical design state must pass authorization and domain validation.

### 2.5 Defense in depth

Security should not depend on one control. Authentication, authorization, tenant predicates, schema validation, domain validation, database constraints, storage controls, rate limits, logging, and testing provide overlapping protection.

### 2.6 Secure failure

Errors should fail closed and reveal no sensitive implementation detail, cross-tenant information, secrets, internal paths, SQL, stack traces, or existence information where the API contract requires resource indistinguishability.

### 2.7 Privacy by minimization

Collect, retain, log, and expose only the data required for product operation, security, billing/usage, audit, and legal obligations.

### 2.8 Explicit trust boundaries

External services and AI models are providers, not trusted application owners. They may propose data but cannot directly establish authoritative state.

---

## 3. Security Scope

The security model covers:

- user authentication
- sessions and tokens
- workspace/company membership
- project authorization
- role and permission enforcement
- multi-tenant isolation
- House Design Model integrity
- AI input/output security
- file uploads and downloads
- client review links
- API security
- database security
- frontend security
- secrets management
- logging and audit trails
- rate limiting and abuse prevention
- dependency and supply-chain security
- backups and recovery
- security testing
- incident response

Out of scope for the MVP unless separately introduced:

- structural engineering authorization
- legal land-survey verification
- government approval systems
- payment-card processing infrastructure owned by the product
- enterprise SSO administration beyond the selected identity provider's capabilities

---

## 4. Security Assets

The highest-value assets are:

| Asset                          | Security requirement                             |
| ------------------------------ | ------------------------------------------------ |
| User identity                  | Confidentiality, integrity, availability         |
| Company/workspace membership   | Integrity and tenant isolation                   |
| Project data                   | Confidentiality and authorization                |
| Plot/site data                 | Confidentiality and integrity                    |
| HouseDesign                    | Highest integrity; tenant-scoped confidentiality |
| DesignVersion                  | Integrity, immutability, confidentiality         |
| Requirements/DesignIntent      | Integrity and confidentiality                    |
| AI prompts and outputs         | Confidentiality and validation                   |
| Site images/files              | Confidentiality and malware-safe handling        |
| Client review tokens           | Strong confidentiality and revocation            |
| Exported documents             | Access-controlled confidentiality                |
| Audit records                  | Integrity and restricted access                  |
| Authentication/session secrets | Highest confidentiality                          |
| API and provider credentials   | Highest confidentiality                          |
| Usage data                     | Integrity and tenant-scoped confidentiality      |

---

## 5. Threat Model

The system should explicitly consider threats from:

1. Unauthenticated internet users.
2. Authenticated users attempting unauthorized access.
3. Users attempting cross-tenant access.
4. Compromised or malicious team members.
5. Leaked or replayed client-review links.
6. Malicious file uploads.
7. Crafted AI prompts and malicious AI outputs.
8. Automated API abuse and denial-of-service attempts.
9. Browser-based attacks such as XSS and CSRF.
10. SQL/ORM injection and unsafe dynamic queries.
11. Dependency or build-chain compromise.
12. Misconfigured storage or deployment infrastructure.
13. Accidental internal data exposure through logs or error responses.
14. Lost-update/concurrency attacks against design state.
15. Abuse of export, generation, or other computationally expensive operations.

Security controls must be prioritized around these realistic attack paths rather than relying on a generic checklist alone.

---

## 6. Trust Boundaries

### 6.1 Browser → API

The browser is untrusted.

All fields must be validated by the API. Client-side validation is convenience only.

### 6.2 API → Database

Application services must enforce authorization before repository access. Repositories must use tenant/project-scoped predicates where applicable.

### 6.3 API → AI provider

AI is an untrusted external service boundary.

The API sends only the minimum required information, receives structured output, validates it, normalizes it, and then passes it through domain validation.

### 6.4 API → Object storage

File access must use server-authorized paths and short-lived signed URLs where appropriate. Public buckets are prohibited for private project files.

### 6.5 Client review → Application

Client review access is a separate trust path from normal user authentication. The token grants only the specific scopes encoded by the application and verified by the server.

### 6.6 Frontend state → Canonical domain state

UI state is never authoritative. Mutations become authoritative only after the server/domain pipeline accepts them.

---

## 7. Identity and Authentication

### 7.1 Authentication boundary

Authentication proves who a user is. Authorization decides what that user may access.

These concerns must remain separate.

### 7.2 Browser session preference

For a browser-based application, the preferred session mechanism is a secure, server-recognized session represented by an `HttpOnly`, `Secure`, appropriately `SameSite` cookie.

If the selected identity provider requires signed access tokens, the backend must validate them with the provider's documented issuer, audience, signature, expiry, and intended-use checks before creating an application session/context.

Long-lived credentials must not be placed in localStorage.

### 7.3 Authentication requirements

Authentication implementation must provide:

- secure password/provider flows as applicable
- account verification as required by the chosen provider
- session expiry
- logout/revocation
- protection against token replay where practical
- brute-force protection
- rate limiting
- secure recovery flows
- secure transport only in non-local environments

### 7.4 Authentication errors

Authentication failures should use consistent public error responses and must not reveal whether a particular account exists where that information is unnecessary.

### 7.5 Secret/session rotation

Session signing/encryption keys and provider credentials must support rotation without committing secrets to source control.

---

## 8. Authorization Model

Authorization is enforced in the API service layer and repository access layer.

A request should be evaluated in this order:

```text
Authenticate
→ Resolve user/workspace context
→ Resolve resource
→ Check tenant ownership/membership
→ Check role/permission
→ Check resource-specific scope
→ Validate request
→ Execute domain action
```

Authorization must never be inferred from a client-supplied `tenantId`, `companyId`, `userId`, role, or permission claim alone.

### 8.1 Workspace/company roles

The product architecture supports at minimum:

- Admin
- Team Member

The model must remain extensible for future roles such as specialized professional roles without rewriting the authorization boundary.

### 8.2 Permission checks

Sensitive operations include:

- create/update/delete project
- modify plot/site data
- generate concepts
- modify canonical design state
- create versions
- restore versions
- create/revoke share links
- export data
- upload/delete files
- invite/remove team members
- view usage information
- administrative workspace operations

Every sensitive operation requires an explicit permission decision.

---

## 9. Multi-Tenant Isolation

### 9.1 Tenant boundary

A company/workspace is a security boundary.

Every tenant-owned resource must be associated with a tenant/workspace identity either directly or through an immutable ownership chain.

### 9.2 Repository enforcement

Tenant filtering must occur in repository/database access, not only in route handlers.

Example conceptual invariant:

```text
resource lookup = resource_id + authorized tenant scope
```

A repository function must not accept a resource identifier alone when tenant scope is required.

### 9.3 Cross-tenant access

A request using a valid identifier belonging to another tenant must not return the resource.

For resources where enumeration risk matters, the API should return a response that does not disclose whether the resource exists.

### 9.4 Tenant context

The trusted tenant context must come from authenticated membership or server-resolved ownership, never directly from arbitrary client input.

### 9.5 Personal projects

Personal homeowner projects follow the same authorization machinery. A personal workspace is a single-member tenant/context rather than a separate security implementation.

---

## 10. Project and Resource Authorization

Project access must be inherited from the authenticated user's workspace membership and explicit project membership rules where introduced.

A child resource such as a DesignVersion, HouseDesign, file, or share configuration must not be accessible merely because the attacker knows its ID.

The authorization chain is conceptually:

```text
User
→ Workspace membership
→ Project access
→ Resource ownership
→ Operation permission
```

Deleting or archiving a project must not bypass cleanup and authorization checks for its child resources.

---

## 11. Canonical House Design Security

HouseDesign integrity is a core security concern.

### 11.1 No direct client overwrite

The client must not be permitted to submit arbitrary complete canonical objects and bypass domain rules simply because the JSON is structurally valid.

Prefer domain actions/commands such as:

- `AddRoom`
- `MoveRoom`
- `ResizeRoom`
- `MoveWall`
- `AddDoor`
- `MoveWindow`
- `UpdateStaircase`
- `ApplyDesignIntent`

Each command is authorized and validated.

### 11.2 Validation pipeline

Every mutation entering authoritative state follows:

```text
Request authentication
→ Authorization
→ DTO/schema validation
→ Domain command validation
→ Geometry/constraint validation
→ Invariant validation
→ Persistence
→ Audit event where required
```

### 11.3 Version integrity

Immutable DesignVersions must never be editable in place.

Restore creates/modifies the active draft through a validated domain operation rather than mutating historical snapshots.

### 11.4 Concurrency

Optimistic concurrency controls must prevent stale clients from silently overwriting newer authoritative state.

---

## 12. AI Security Model

AI is an untrusted recommendation and interpretation boundary.

### 12.1 AI cannot directly mutate canonical state

The AI layer must never:

- write final wall coordinates directly to the database
- create authoritative Room/Wall/Opening records without validation
- bypass authorization
- call arbitrary internal APIs
- execute generated code
- issue SQL or database commands
- choose a tenant/project target from untrusted prompt text

### 12.2 Prompt input security

User-provided text must be treated as data.

Prompts must not allow instructions in user text to alter application-level security rules.

System/developer instructions, application configuration, and authorization context must remain controlled by the application.

### 12.3 AI output validation

AI responses must pass:

1. transport/format validation
2. schema validation
3. normalization
4. semantic/business validation
5. domain validation
6. design-engine feasibility validation where applicable

Invalid output must be rejected rather than partially trusted.

### 12.4 Provider isolation

All AI access goes through `IAIProvider` or its application-level equivalent.

Provider-specific SDK objects must not leak into the domain layer.

### 12.5 Data minimization

Only information necessary for the AI task should be sent to the provider.

Avoid sending unrelated user profile information, secrets, authentication material, or private files not required by the task.

### 12.6 AI logging

Do not log complete prompts/responses by default if they contain private project information. Use redacted metadata, request IDs, provider model identifiers, token/usage metadata, validation outcomes, and bounded diagnostic fields instead.

---

## 13. File Upload Security

Files may include site photographs, survey material, exported documents, and future design assets.

### 13.1 Upload validation

Validate at minimum:

- authenticated user and tenant ownership
- upload purpose/category
- allowed file type
- declared MIME type
- actual file signature where applicable
- file size
- filename length
- filename normalization
- project association

Do not trust only the filename extension or browser-provided MIME type.

### 13.2 Storage names

Store files using generated opaque identifiers rather than user-supplied filenames.

Original filenames may be retained only as metadata when necessary.

### 13.3 Private storage

Private project assets must not be exposed from guessable public paths.

Downloads should use server authorization followed by short-lived signed access URLs where appropriate.

### 13.4 Malware protection

The architecture should provide a pluggable scanning boundary so malware scanning can be introduced as usage requires.

High-risk or unsupported file types must be rejected.

### 13.5 Image processing

Image processing must occur in isolated, resource-limited workers or libraries with safe decompression/resource limits where practical.

Protect against image bombs and extreme dimensions.

### 13.6 Path safety

Never construct storage paths from raw user-controlled path segments without strict validation.

---

## 14. Client Review Share Links

Client review links are a dedicated access mechanism and must remain separate from normal authenticated sessions.

### 14.1 Token properties

Share links should use cryptographically random, high-entropy opaque identifiers.

Do not place permissions, internal database IDs, or sensitive project data directly in a bearer URL when an opaque server-side token can be used.

### 14.2 Scope

A share link must reference:

- one intended project/design context
- one intended DesignVersion where version-scoped review is required
- explicit allowed actions
- expiration policy
- revocation state

### 14.3 Permissions

Supported review scopes may include:

- read
- comment
- approve, when explicitly enabled by product requirements

No share link should inherit the full permissions of the project owner.

### 14.4 Revocation

Revocation must take effect server-side immediately for subsequent requests.

### 14.5 Expiration

Expiration should be enforced server-side and verified for every use.

### 14.6 Leak response

Treat a share link as a bearer credential. The application should provide revocation and regeneration rather than attempting to recover a leaked token.

Avoid logging raw share tokens.

---

## 15. API Security

### 15.1 Transport

Production traffic must use HTTPS.

HTTP should not be accepted for authenticated production sessions except where redirected/handled by the deployment platform before the application boundary.

### 15.2 Request validation

All externally supplied data must be validated against explicit schemas before reaching domain logic.

This includes:

- path parameters
- query parameters
- body payloads
- pagination values
- sort/filter parameters
- upload metadata
- share-token inputs
- AI provider outputs

### 15.3 Mass assignment protection

Do not map arbitrary request JSON directly into database/domain objects.

Only explicitly supported fields may be changed by each endpoint/command.

### 15.4 Method and content checks

Endpoints should reject unsupported HTTP methods and content types with controlled responses.

### 15.5 Rate limiting

Rate limits should be applied according to risk and cost.

Stricter limits are appropriate for:

- login/recovery
- AI generation
- concept generation
- export generation
- share-link creation
- file uploads
- public review endpoints

### 15.6 Idempotency

Expensive or retry-prone operations such as generation/export should support idempotency keys when needed to avoid accidental duplicate work.

### 15.7 Pagination

List endpoints must enforce maximum page sizes and bounded query complexity.

### 15.8 Error handling

Public error responses should contain stable machine-readable error codes and safe messages.

Never expose:

- stack traces
- SQL
- internal filesystem paths
- secret values
- provider credentials
- implementation-only identifiers unless intentionally part of the API contract

---

## 16. Browser Security

### 16.1 XSS protection

React's default escaping should be preserved. Avoid raw HTML rendering unless explicitly required and sanitized.

User-generated comments, project names, descriptions, and AI-generated text must not be inserted into the DOM as trusted HTML.

### 16.2 Content Security Policy

A production deployment should define a Content Security Policy compatible with React, required APIs, and WebGL resources.

The policy should be tightened as external resources are finalized.

### 16.3 Security headers

Use appropriate production headers, including where applicable:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame-ancestors policy

Do not use an insecure blanket policy merely to make third-party integration work.

### 16.4 Clickjacking

Authenticated application pages should not be frameable by untrusted origins.

Client review embedding, if ever supported, must be an explicit product decision with a deliberately configured framing policy.

### 16.5 Sensitive browser storage

Do not store long-lived authentication secrets, raw API keys, or privileged share tokens in localStorage/sessionStorage.

---

## 17. CSRF and Session Protection

If browser authentication uses cookies, state-changing requests require CSRF protection appropriate to the chosen architecture.

Controls may include:

- SameSite cookie policy
- anti-CSRF tokens where required
- Origin/Referer validation for browser requests where appropriate
- strict CORS policy

CSRF protection must be tested rather than assumed from cookie configuration alone.

---

## 18. CORS

Production CORS must use an explicit allowlist of trusted application origins.

Do not deploy with a wildcard origin together with credentials.

Development origins may be configured separately.

CORS is not authorization; server-side authorization remains mandatory even for requests from trusted origins.

---

## 19. Injection Protection

### 19.1 SQL injection

Use Prisma parameterized operations and avoid constructing raw SQL from untrusted input.

Where raw SQL is genuinely required, parameters must remain bound rather than interpolated.

### 19.2 NoSQL injection

Not applicable to the primary PostgreSQL persistence model, but the same rule applies to any future non-relational integration.

### 19.3 Command injection

The application must never pass arbitrary user or AI-generated strings to a shell.

### 19.4 Template injection

Templates used for exports or notifications must not interpret user content as executable template code.

### 19.5 Path traversal

All local/server filesystem operations must reject traversal sequences and operate through controlled paths.

---

## 20. SSRF Protection

If the system later accepts user-supplied URLs or fetches external resources, remote fetching must occur through an isolated service with:

- allowed URL schemes
- private-network blocking
- localhost/metadata endpoint blocking
- DNS rebinding protections
- redirect validation
- response size limits
- timeouts
- destination allowlists where feasible

The MVP should avoid unnecessary server-side URL fetching.

---

## 21. Database Security

### 21.1 Credentials

Database credentials must come from the environment/secret manager and never from source control.

### 21.2 Least privilege

The runtime application database role should have only the permissions required by the application.

Migration credentials should be separated from ordinary runtime credentials where practical.

### 21.3 Tenant predicates

Application repositories must enforce tenant/project scoping.

Database-level row-level security may be introduced later if the deployment and ORM strategy support it cleanly, but application-level isolation is mandatory regardless.

### 21.4 Constraints

Use database constraints for durable integrity where appropriate:

- primary keys
- foreign keys
- unique constraints
- not-null requirements
- controlled enums/statuses
- version/concurrency fields

Domain validation remains responsible for richer geometry/business invariants.

### 21.5 Backups

Production databases require automated backups appropriate to the selected hosting provider, plus periodic restore testing.

A backup that has never been restored is not considered operationally verified.

---

## 22. Secret Management

### 22.1 Never commit secrets

The following must never be committed:

- API keys
- OAuth client secrets
- database passwords
- session signing keys
- storage credentials
- CI tokens
- private certificates/keys
- provider credentials

### 22.2 Local development

Use ignored environment files or local secret mechanisms.

Provide a committed `.env.example` containing names only and safe placeholder values.

### 22.3 Production

Use the deployment platform's encrypted secret/configuration facility or a dedicated secret manager.

### 22.4 Rotation

Document rotation procedures for:

- application secrets
- AI provider keys
- database credentials
- storage credentials
- authentication keys

### 22.5 Secret scanning

CI should include secret scanning or equivalent repository checks before merges/releases.

---

## 23. Logging and Audit Security

### 23.1 Structured logging

Use structured logs with correlation/request IDs.

### 23.2 Never log secrets

Do not log:

- passwords
- session cookies
- authorization headers
- raw share tokens
- API keys
- database credentials
- private signed URLs

### 23.3 Sensitive data minimization

Prompts, comments, uploaded filenames, project details, and site information may contain private data. Logging should use redaction and bounded metadata.

### 23.4 Security events

Audit/security logs should capture important events such as:

- authentication success/failure patterns as appropriate
- membership changes
- role/permission changes
- project access changes
- version restore
- share-link creation/revocation
- export creation
- sensitive administrative operations
- suspicious authorization failures

### 23.5 Audit integrity

Audit records should be append-oriented and access-controlled. Ordinary users must not be able to rewrite audit history.

---

## 24. Rate Limiting and Abuse Controls

Security and cost controls overlap for this product because AI generation, exports, and design computation can be expensive.

Apply quotas/rate limits to:

- authentication endpoints
- AI requests
- concept generation
- layout generation
- export generation
- uploads
- share creation
- comments/public review traffic

The application should distinguish between:

- authenticated normal use
- repeated failed authentication
- suspicious/high-volume traffic
- provider quota exhaustion
- legitimate heavy professional workloads

Rate limiting must degrade safely without corrupting design state.

---

## 25. Design Engine Security

The deterministic engine is not an internet-facing trust boundary by itself, but malicious inputs can attempt to cause excessive computation or memory use.

### 25.1 Resource limits

Bound:

- maximum plot dimensions accepted by MVP rules
- maximum room count
- maximum furniture/object count where applicable
- maximum concept count requested by a single operation
- maximum generation time
- maximum recursion/iteration counts
- maximum serialized input size

### 25.2 Determinism

Use controlled seeds for reproducible generation and diagnostics.

### 25.3 Failure behavior

When constraints are impossible or resource limits are reached, return a structured failure. Never produce a partially committed canonical design as a success result.

---

## 26. Export Security

Exports may contain highly sensitive project information.

### 26.1 Authorization

An export can be generated or downloaded only by a permitted actor or valid scoped review context.

### 26.2 Temporary artifacts

Generated export files should use controlled storage paths and expiration/cleanup policies.

### 26.3 Metadata

Avoid embedding unnecessary secrets or internal identifiers into PDFs or other client-visible exports.

### 26.4 Print/share distinction

A user-visible export is not automatically equivalent to a public share link.

---

## 27. Frontend Authorization and UX

The frontend may hide controls the current user cannot use, but this is only a UX optimization.

The server must independently reject the operation.

When permissions change while a user is active, the API's latest authorization decision takes precedence over stale frontend state.

---

## 28. Dependency and Supply-Chain Security

Use the smallest reasonable dependency set.

For each dependency:

- pin/lock versions through the package lockfile
- review major upgrades
- monitor known vulnerabilities
- remove unused packages
- avoid abandoned packages for security-sensitive functions

CI should run appropriate dependency vulnerability checks.

Production builds should be reproducible from committed lockfiles and approved configuration.

---

## 29. CI/CD Security Gates

Before merge/release, CI should verify at minimum:

- TypeScript compilation
- linting
- formatting checks
- unit/domain tests
- design-engine tests
- API/integration tests
- security regression tests
- authorization/tenant isolation tests
- dependency/security checks
- secret scanning
- production build

Critical security failures must block release.

---

## 30. Security Testing Strategy

Security testing must be part of normal development, not only a final review.

### 30.1 Authentication tests

Cover:

- valid authentication
- invalid credentials
- expired sessions
- revoked sessions
- logout behavior
- recovery abuse controls
- rate limiting

### 30.2 Authorization tests

Every protected resource must be tested for:

- allowed role
- denied role
- same-tenant access
- cross-tenant access
- missing authentication
- stale membership
- deleted/revoked membership

### 30.3 BOLA/IDOR tests

Attempt access by changing:

- project IDs
- design IDs
- version IDs
- file IDs
- share IDs
- comment IDs

The attacker must not obtain another tenant's data.

### 30.4 AI security tests

Test:

- malformed AI JSON
- schema violations
- contradictory fields
- unsafe/injected prompt content
- impossible requirements
- oversized outputs
- provider failures
- provider timeouts
- partial responses

No malformed AI output may become authoritative design state.

### 30.5 File security tests

Test:

- invalid extension
- spoofed MIME type
- oversized files
- malformed images/documents
- unauthorized download
- cross-tenant download
- traversal-style filenames
- duplicate upload handling

### 30.6 Share-link tests

Test:

- valid token
- expired token
- revoked token
- malformed token
- wrong version scope
- wrong permission scope
- cross-tenant token misuse
- token enumeration resistance

### 30.7 Browser tests

Cover relevant XSS, CSRF, CORS, framing, and security-header behavior.

### 30.8 Abuse tests

Test expensive endpoints under repeated requests to verify throttling and safe failure.

---

## 31. Secure Development Workflow

Every feature that touches protected data must include a security review for:

1. Authentication impact.
2. Authorization impact.
3. Tenant isolation.
4. Input validation.
5. Data exposure.
6. File/storage impact.
7. Logging/PII impact.
8. AI trust boundary if applicable.
9. Concurrency/integrity impact.
10. New dependencies/secrets.

Security-sensitive code should be reviewed before merging.

---

## 32. Security Review of the Main Product Flow

The intended flow is:

```text
Login
→ Project
→ Plot & Site
→ Requirements
→ AI Design Brief
→ Design Preferences
→ Constraint Model
→ Concept Generation
→ Plan Analysis
→ 2D Editor
→ Versioning
→ 3D
→ Walkthrough
→ Client Review
→ Export
```

Security controls apply at each boundary.

### Login

Authenticate and establish trusted user/workspace context.

### Project

Verify workspace membership and project authorization.

### Plot & Site

Validate and tenant-scope site data and uploaded assets.

### Requirements

Validate input length, structure, and ownership.

### AI Design Brief

Treat AI output as untrusted and validate before use.

### Constraint Model

Validate hard/soft constraint data against domain rules.

### Concept Generation

Authorize the operation and enforce computation/usage limits.

### Plan Analysis

Read only authorized canonical state.

### 2D Editor

Mutations use domain commands and concurrency controls.

### Versioning

Historical snapshots remain immutable and tenant-scoped.

### 3D / Walkthrough

Derive from authorized canonical state; never create an alternate authoritative model.

### Client Review

Use dedicated scoped/revocable share credentials.

### Export

Re-check authorization and produce controlled private artifacts.

---

## 33. Privacy and Data Retention

Retention rules should be defined per data category rather than applying one indefinite retention policy.

Consider separate policies for:

- active projects
- archived/deleted projects
- design versions
- site uploads
- generated exports
- client comments
- audit records
- authentication/security logs
- usage records

Deletion workflows must consider legal/business requirements and immutable audit needs.

Hard deletion should not accidentally create dangling references or bypass audit requirements.

---

## 34. Backup and Disaster Recovery

Security includes availability and recoverability.

### 34.1 Backup requirements

Back up production PostgreSQL according to an appropriate recovery objective.

### 34.2 File recovery

Project files stored outside the database require independent recovery/versioning strategy.

### 34.3 Restore testing

Perform periodic restore tests for:

- database
- critical project records
- file/object storage references

### 34.4 Recovery integrity

After recovery, validate that:

- tenant relationships remain intact
- DesignVersions remain immutable
- foreign keys remain valid
- storage references remain resolvable
- security configuration is restored correctly

---

## 35. Incident Response

A basic incident process must exist before production launch.

### 35.1 Example incident classes

- credential compromise
- cross-tenant data exposure
- leaked share-link credential
- malicious file upload
- AI/provider compromise or unsafe output
- database exposure
- dependency vulnerability
- denial-of-service/abuse

### 35.2 Response sequence

```text
Detect
→ Contain
→ Revoke/rotate affected credentials
→ Preserve relevant evidence
→ Assess scope
→ Remediate
→ Verify
→ Communicate as required
→ Document lessons
```

### 35.3 Credential compromise

Have a documented process for rotating:

- AI provider keys
- database credentials
- storage credentials
- session/signing secrets
- external API credentials

---

## 36. Security Invariants

The following invariants are mandatory:

1. No protected API operation executes without server-side authorization.
2. Tenant-owned data cannot be returned to another tenant.
3. A known resource ID is never sufficient for access.
4. The frontend is never an authorization authority.
5. AI output is never trusted solely because it is valid JSON.
6. AI cannot directly establish authoritative geometry.
7. Invalid geometry cannot become authoritative HouseDesign state.
8. Historical DesignVersions are immutable.
9. Share links cannot inherit project-owner permissions.
10. Revoked/expired share links cannot access protected review data.
11. Secrets are not stored in source control.
12. Private files are not publicly addressable by predictable paths.
13. Security-sensitive operations produce appropriate audit/security records.
14. Errors do not disclose secrets or unnecessary internal information.
15. Expensive operations have bounded resource usage.
16. Security boundaries remain enforced during restore, export, and background processing.

---

## 37. Security Ownership by Layer

| Layer                | Primary security responsibility                                     |
| -------------------- | ------------------------------------------------------------------- |
| React/Web            | Safe rendering, secure browser storage choices, UX permission state |
| API routes           | Authentication context, request parsing, input limits               |
| Application services | Authorization orchestration, business policy                        |
| Domain               | Canonical-state invariants and valid mutations                      |
| Design engine        | Geometry/resource safety and deterministic validation               |
| Repositories         | Tenant/project scoping and safe persistence                         |
| Database             | Durable constraints and credential isolation                        |
| AI adapter           | Provider isolation, output handling, data minimization              |
| Storage adapter      | Private access, signed URLs, object isolation                       |
| Background workers   | Authorization context, resource limits, secure execution            |
| CI/CD                | Secret scanning, dependency checks, test/security gates             |
| Infrastructure       | TLS, network restrictions, secret storage, backups                  |

No layer should assume another layer makes it unnecessary to apply its own appropriate controls.

---

## 38. Recommended MVP Security Baseline

Before the MVP is considered production-ready, the following must exist:

- HTTPS in production
- authenticated sessions
- server-side authorization
- tenant/project isolation
- role/permission checks
- schema validation
- domain validation
- optimistic concurrency
- secure file upload handling
- private object storage
- scoped/revocable client review links
- AI output validation
- rate limits on high-risk endpoints
- secure error responses
- secret management
- audit/security logging
- dependency checks
- secret scanning
- authorization/BOLA tests
- AI security tests
- file security tests
- backup and restore procedure

Advanced controls can be added incrementally without weakening these fundamentals.

---

## 39. Security Open Questions

### 39.1 Identity provider

Which authentication provider or managed identity solution will be selected for production?

The architecture should preserve the application authorization model regardless of provider choice.

### 39.2 Session model

Will the final implementation use a managed session provider, application-managed opaque sessions, or provider-issued access tokens translated into an application session?

### 39.3 Share-link policy

What maximum lifetime and default permissions should client review links have?

### 39.4 File scanning

At what upload volume/risk threshold should malware scanning become mandatory rather than pluggable infrastructure?

### 39.5 Security monitoring

Which low-cost production monitoring and alerting mechanism will be selected for authentication anomalies, authorization failures, application errors, and abuse?

### 39.6 Data retention

What business/legal retention periods should apply to projects, deleted projects, exports, comments, audit logs, and uploaded site files?

### 39.7 Enterprise requirements

Will future company customers require SSO, SCIM, advanced audit export, IP restrictions, or additional tenant controls?

These should remain future capabilities unless the product scope changes.

---

## 40. Final Security Review Checklist

Before a production release, verify:

### Identity

- [ ] Authentication flow is documented and tested.
- [ ] Sessions expire and can be revoked.
- [ ] No long-lived auth secrets are stored in localStorage.
- [ ] Recovery/account flows are rate-limited.

### Authorization

- [ ] Every protected route requires server-side authorization.
- [ ] Tenant/project scope is enforced in repositories.
- [ ] Role/permission checks are tested.
- [ ] BOLA/IDOR regression tests pass.

### Canonical model

- [ ] Every mutation uses an authorized domain operation.
- [ ] AI cannot directly create authoritative geometry.
- [ ] Invalid designs are rejected.
- [ ] Version snapshots are immutable.
- [ ] Concurrency controls are enforced.

### AI

- [ ] Provider keys are secret.
- [ ] AI input is minimized.
- [ ] AI output is treated as untrusted.
- [ ] Schema and semantic validation are enforced.
- [ ] Provider failure cannot corrupt canonical state.

### Files

- [ ] File type/signature and size are validated.
- [ ] Private assets are not public by default.
- [ ] Generated object names are opaque.
- [ ] Unauthorized downloads are rejected.
- [ ] File-processing resource limits exist.

### Client review

- [ ] Tokens are high entropy and opaque.
- [ ] Tokens are scoped.
- [ ] Tokens expire.
- [ ] Tokens can be revoked.
- [ ] Raw tokens are not logged.

### API/browser

- [ ] HTTPS is enforced in production.
- [ ] CORS is restricted.
- [ ] CSRF protections match the chosen session model.
- [ ] Security headers are configured.
- [ ] Error responses are sanitized.
- [ ] Rate limiting is active on expensive/sensitive operations.

### Infrastructure

- [ ] Secrets are not committed.
- [ ] Secret scanning is active.
- [ ] Dependency security checks are active.
- [ ] Database backups exist.
- [ ] Restore has been tested.
- [ ] Production storage is private.

---

## 41. Security Summary

The security architecture is built around one central principle: **protect the boundary where untrusted input becomes authoritative product state**.

The strongest controls therefore surround:

- authentication
- tenant isolation
- authorization
- canonical HouseDesign mutations
- AI output validation
- file handling
- client review credentials
- immutable versioning
- concurrency
- auditability

The product should prefer simple, auditable security controls over unnecessary infrastructure complexity. As the platform grows from homeowner use to professional multi-tenant workloads, additional enterprise security capabilities can be layered onto the same authorization, tenant-isolation, and canonical-state foundations without changing the core domain model.
