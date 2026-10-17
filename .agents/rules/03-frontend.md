---
trigger: always_on
---

# Frontend Engineering Standards

The frontend is a production-grade web application.

Use TypeScript and maintain strict type safety.

## Component architecture

- Use reusable components.
- Keep components focused on one responsibility.
- Avoid large monolithic components.
- Keep business logic outside presentation components.
- Prefer existing shared components before creating duplicates.
- Avoid unnecessary abstractions.

## State management

Keep state as close as possible to where it is used.

Separate:

- UI state
- form state
- server state
- domain/design state

Do not duplicate the same source of truth across multiple stores.

The canonical House Design Model must remain the authoritative design state.

## Forms

Every form must provide:

- accessible labels
- validation
- clear error messages
- loading state
- disabled state during submission where appropriate
- successful submission feedback
- keyboard accessibility

Never rely only on browser validation for important business rules.

## Async operations

Every user-facing asynchronous operation must handle:

- loading
- success
- empty state
- validation error
- server error
- network error

Never leave the user with a blank screen or silently failing action.

## Responsive design

Every page must work on:

- desktop
- tablet
- mobile

Do not design desktop-only interfaces.

Avoid:

- fixed widths that break layouts
- horizontal page overflow
- hover-only critical actions

Touch targets and interactive elements must remain usable on mobile.

## Accessibility

Use semantic HTML.

Provide:

- accessible labels
- keyboard navigation
- visible focus states
- appropriate ARIA only when necessary
- sufficient text contrast
- meaningful empty/error states

Do not rely only on color to communicate important information.

## UI consistency

Use the project's shared design system.

Keep consistent:

- spacing
- typography
- buttons
- inputs
- dialogs
- cards
- tables
- error messages
- loading indicators

Do not introduce a new visual pattern when an existing component already solves the problem.

## Performance

Avoid unnecessary:

- re-renders
- large client-side computations
- expensive effects
- duplicated API requests
- unnecessarily large dependencies

For heavy operations such as floor-plan generation or 3D rendering,
keep computation isolated from unrelated UI state.

Use lazy loading/code splitting for heavy features where appropriate.

## Errors

Do not expose raw technical errors to users.

Convert server/API failures into clear user-friendly messages.

Never leave production debugging statements such as console.log
in application code.

## Design editor

For the 2D floor-plan editor:

- keep interaction smooth
- preserve undo/redo correctness
- validate changes before committing them
- prevent invalid geometry where possible
- never silently lose user changes

For 3D:

- keep the UI responsive
- avoid loading unnecessary assets
- provide clear loading/error states
- handle devices with limited graphics capability gracefully.
