---
trigger: always_on
---

# Core Engineering Standards

This project is a production-grade SaaS application.

Priorities:

1. Correctness
2. Security
3. Maintainability
4. Testability
5. Accessibility
6. Performance
7. Developer experience
8. Implementation speed

Before changing code:

- Inspect the existing project structure.
- Read relevant files.
- Understand existing architecture and patterns.
- Identify affected modules.
- Check existing tests.
- Produce an implementation plan before coding.

Rules:

- Do not modify unrelated code.
- Do not silently change approved architecture.
- Do not introduce dependencies without justification.
- Do not duplicate business logic.
- Do not leave debugging code or unexplained TODOs.
- Never expose secrets.
- Never trust external input.
- Never claim "zero bugs".
- Never claim "production ready" without verification.

A feature is complete only after appropriate:

- validation
- error handling
- tests
- lint
- type checking
- production build
- browser verification
- security review
- final diff review

If verification fails, report it honestly.
