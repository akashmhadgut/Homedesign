---
trigger: always_on
---

# Backend Engineering Standards

The backend is a production-grade TypeScript API.

## Architecture

Keep these responsibilities separate:

- Routes
- Controllers
- Application services
- Domain logic
- Repositories
- Infrastructure
- Database
- External integrations

Controllers must remain thin.

Do not put business rules inside route handlers.

Business logic must live in services/domain modules.

Database access must not be performed directly from React or
presentation-layer code.

## API contracts

Every endpoint must explicitly define:

- HTTP method
- route
- authentication requirement
- authorization requirement
- input schema
- output schema
- validation rules
- expected errors

Use typed request/response DTOs.

Do not expose internal database models directly as API contracts
when a dedicated DTO is appropriate.

## Validation

Validate all external input at the API boundary.

Validate:

- request body
- query parameters
- route parameters
- uploaded files
- imported data
- AI-generated data

Never assume frontend validation is sufficient.

## Error handling

Use consistent structured error responses.

Do not expose:

- stack traces
- database errors
- internal file paths
- secrets
- implementation details

to clients.

Errors must be:

- predictable
- logged appropriately
- safe for the client
- useful for debugging

## Authentication

Protected endpoints must verify authentication on the server.

Never trust:

- client-side role values
- hidden form fields
- frontend route protection
- client-provided ownership information

## Authorization

Every resource belonging to a user/company/project must verify that
the authenticated user is allowed to access it.

Check ownership or explicit permission on the server.

Never rely only on IDs supplied by the client.

## Database

Use the project's database abstraction consistently.

Do not place raw database queries throughout the application.

Keep database operations inside repositories/infrastructure.

Use transactions for operations that must succeed or fail together.

Handle:

- unique constraints
- foreign-key constraints
- concurrent updates
- missing records
- stale records

explicitly.

## House Design data

The backend must preserve the canonical House Design Model.

Do not allow arbitrary frontend JSON to overwrite design state.

Changes to house geometry must go through the appropriate domain
validation.

## AI integration

AI responses are untrusted.

AI output must pass:

parse
→ schema validation
→ normalization
→ business validation
→ domain validation

before persistence or domain mutation.

Never execute AI-generated code or commands.

Never allow an AI response to bypass authorization.

## File handling

Uploaded site images, survey files and design exports must:

- have size limits
- use allowed file types
- be validated
- receive safe storage names
- have access control
- never be executed as code

## Rate limiting

Rate-limit appropriate expensive or sensitive endpoints:

- login
- password/reset
- AI requests
- layout generation
- file uploads
- public share endpoints
- expensive export operations

## Logging

Use structured logs where appropriate.

Never log:

- passwords
- tokens
- API keys
- database credentials
- sensitive user data

Logs should contain enough context to diagnose failures without
exposing confidential information.

## Performance

Avoid unnecessary:

- database queries
- repeated external API calls
- unbounded result sets
- large synchronous operations

Use pagination for potentially large collections.

Use appropriate indexes for frequently queried fields.

Heavy operations such as layout generation, large exports and
future rendering jobs should be designed so they do not block
ordinary API requests unnecessarily.

## Testing

Backend features must include appropriate:

- unit tests
- service tests
- repository/integration tests
- API tests
- authorization tests
- validation tests
- failure-path tests

Never remove tests to make the build pass.

## Dependencies

Before adding a backend dependency:

1. Check whether the project already provides the functionality.
2. Check whether an existing dependency can solve it.
3. Explain why the new dependency is necessary.
4. Keep the dependency surface small.
