---
trigger: always_on
---

# Architecture Rules

This application must use clear and explicit module boundaries.

## Separation of responsibilities

Keep these concerns separate:

- Presentation / UI
- Application services
- Domain logic
- Infrastructure
- Persistence
- AI integration

Do not place core business logic inside React components.

Do not make UI components directly responsible for database operations.

Do not allow AI code to directly own or modify authoritative domain state.

## House Design Model

The House Design Model is the single source of truth for the application.

The same canonical model must power:

- 2D rendering
- 2D editing
- 3D generation
- 3D viewing
- walkthrough
- validation
- analysis
- export
- client review

Never maintain separate authoritative 2D and 3D design states.

## AI boundary

AI is an untrusted interpretation layer.

AI may:

- understand natural-language requirements
- extract structured requirements
- create design intent
- propose controlled design actions

AI must NOT directly:

- author authoritative geometry
- bypass domain validation
- write arbitrary database state
- execute generated code
- bypass authorization

Every AI response must pass:

AI output
→ parsing
→ schema validation
→ normalization
→ business validation
→ domain validation
→ accept/reject

Only validated data may enter the House Design Model.

## Module boundaries

Modules must communicate through explicit contracts.

Do not access another module's internal implementation directly when
a public service, interface, or domain contract exists.

Avoid:

- circular dependencies
- duplicated business logic
- hidden coupling
- unnecessary abstractions
- direct database access from UI components

## Architecture changes

Do not silently change approved architecture.

If a feature requires an architectural change:

1. Stop implementation.
2. Explain why the current architecture is insufficient.
3. Propose the change.
4. Identify affected modules.
5. Wait for approval before implementing it.
