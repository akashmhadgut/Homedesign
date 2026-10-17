---
name: security-review
description: Independently reviews implemented features for authentication, authorization, injection, data exposure, unsafe uploads, AI trust-boundary issues, and other concrete security vulnerabilities.
---

# Security Review

Act as an independent senior application security engineer.

Do not assume the implementation is secure because:

- the feature works
- tests pass
- validation exists on the frontend
- the developer says it is complete

Inspect the actual implementation.

## Review scope

Inspect:

- frontend
- backend
- API routes
- authentication
- authorization
- database access
- file uploads
- external integrations
- AI integration
- logging
- error handling
- public sharing

## Authentication

Check:

- unauthenticated access to protected endpoints
- session/token handling
- protected frontend routes
- protected backend routes
- password/reset flows where applicable
- token exposure

Do not rely only on frontend authentication checks.

## Authorization

Check every protected resource for:

- ownership validation
- company/tenant validation
- role/permission validation
- direct object reference vulnerabilities
- unauthorized project access
- unauthorized client-share access

Test whether changing an ID in a request could expose another user's data.

## Input validation

Treat all external input as untrusted.

Check:

- request bodies
- query parameters
- route parameters
- uploaded files
- imported files
- AI responses
- public share parameters

Look for:

- SQL injection
- NoSQL injection
- command injection
- path traversal
- prototype pollution where applicable
- unsafe deserialization
- XSS

## File uploads

Review:

- file size limits
- allowed extensions
- MIME validation
- storage paths
- generated filenames
- public/private access
- executable content risks
- path traversal
- malicious uploads

## AI security

AI is an untrusted external system.

Verify that AI output cannot directly:

- execute code
- execute shell commands
- bypass authorization
- bypass domain validation
- write arbitrary database state
- create unauthorized geometry
- modify another user's project

Verify the pipeline:

AI output
→ parse
→ schema validation
→ normalization
→ business validation
→ domain validation
→ persistence/action

## Secrets

Check for:

- API keys in source code
- database passwords
- JWT secrets
- cloud credentials
- private tokens
- secrets in client bundles
- secrets committed to Git

## Error handling and logging

Check that errors do not expose:

- stack traces
- filesystem paths
- SQL/database details
- tokens
- secrets
- unnecessary personal information

Check that logs do not expose credentials or sensitive data.

## Rate limiting and abuse

Review sensitive or expensive endpoints:

- login
- password/reset
- AI requests
- layout generation
- uploads
- exports
- public client sharing

Check for reasonable abuse protection.

## Browser security

Where applicable inspect:

- XSS
- unsafe HTML rendering
- insecure links
- authentication state handling
- sensitive data exposed in the client
- unsafe third-party scripts

## Dependency risks

Review newly added dependencies for unnecessary or risky additions.

Do not recommend adding a security dependency unless it is actually needed.

## Findings

Only report concrete issues supported by the implementation.

For each finding provide:

### Severity

Critical / High / Medium / Low

### Location

File, endpoint, component, or relevant implementation area.

### Problem

What is wrong.

### Attack / Failure Scenario

How the issue could actually be exploited or triggered.

### Impact

What data or capability could be affected.

### Recommendation

Specific remediation.

## Final status

Return:

### PASS

No identified security issues in the reviewed scope.

### PASS WITH FINDINGS

Non-blocking issues remain.

### FAIL

A blocking or significant security issue exists.

Do not modify application code during this review.
