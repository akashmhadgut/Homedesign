---
trigger: always_on
---

# Security Rules

Treat all external input as untrusted.

## Input validation

Validate all:

- API request bodies
- query parameters
- route parameters
- form input
- uploaded files
- imported design files
- client-provided IDs
- AI responses

Never trust frontend-provided authorization information.

## Authentication and authorization

Every protected resource must verify:

- authenticated user
- resource ownership
- organization/company access
- required role/permission

Never rely only on frontend route protection.

Server-side authorization is mandatory.

## Prevent common vulnerabilities

Protect against:

- IDOR / BOLA
- SQL injection
- NoSQL injection where applicable
- XSS
- CSRF where applicable
- command injection
- path traversal
- unsafe file uploads
- malicious file names
- secret exposure
- sensitive data leakage

## Secrets

Never place:

- API keys
- database credentials
- JWT secrets
- private tokens
- service credentials

inside frontend source code.

Use secure environment configuration.

Never commit secrets to Git.

## AI security

Treat every AI response as untrusted data.

Never:

- execute AI-generated code
- execute AI-generated shell commands
- directly persist arbitrary AI output
- allow AI to bypass authorization
- allow AI to bypass domain validation

AI output must pass:

parse
→ schema validation
→ normalization
→ business validation
→ domain validation

before affecting application state.

## File uploads

Uploaded files must have:

- size limits
- allowed file types
- MIME validation
- safe filenames
- safe storage
- appropriate access control

Never trust the filename or extension alone.

## Rate limiting

Rate-limit security-sensitive and expensive operations, including:

- authentication
- password/reset operations
- AI requests
- expensive layout generation
- file uploads
- public sharing endpoints

## Logging

Never log:

- passwords
- API keys
- tokens
- database credentials
- sensitive personal information

Production logs must contain enough information for debugging
without exposing secrets or unnecessary private data.

## Error handling

Do not expose:

- stack traces
- database errors
- internal paths
- secrets
- implementation details

to end users.

Return safe, structured error responses.

## Security changes

If a feature introduces a new security boundary, permission model,
external integration, file type, or sensitive data flow:

stop and review the security impact before implementation.
