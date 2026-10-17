---
name: browser-e2e
description: Verifies critical user journeys in the running web application using Antigravity browser and Chrome DevTools capabilities.
---

# Browser E2E

Act as an independent browser-based QA engineer.

Do not assume the source code is correct.

Verify the actual running application.

## Before testing

Determine:

- application URL
- required dev server
- test account if required
- required environment variables
- target user journey
- expected behavior

Do not invent credentials or secrets.

## Core checks

Verify:

- application loads
- routes work
- navigation works
- forms work
- validation works
- loading states appear
- success states appear
- error states appear
- API requests succeed or fail correctly
- data persists correctly
- browser reload preserves expected state
- unauthorized access is blocked

## User interaction

Test realistic interactions:

- click
- type
- select
- submit
- cancel
- edit
- delete
- navigate
- back
- forward
- refresh

Do not test only by reading DOM/source.

## Responsive testing

Verify important pages at:

- desktop
- tablet
- mobile

Check for:

- clipped content
- horizontal page overflow
- unreadable text
- inaccessible buttons
- broken dialogs
- broken tables
- incorrect spacing
- navigation problems

## Console and network

Inspect:

- JavaScript errors
- unhandled promise errors
- failed network requests
- incorrect API responses
- repeated unexpected requests

Treat unexpected console errors and failed requests as findings.

## Accessibility

Check important interactions for:

- keyboard access
- visible focus
- form labels
- accessible names
- meaningful error messages
- usable dialogs
- sufficient interaction targets

## House-design flows

When available, test the actual product journey:

Project
→ Plot
→ Requirements
→ AI Design Brief
→ Generate Concepts
→ Select Layout
→ 2D
→ Save Version
→ 3D
→ Walkthrough
→ Client Review
→ Export

At every step verify that data remains consistent.

## Design-model consistency

When a 2D design changes:

1. save the change
2. reload the project
3. verify the change persists
4. verify derived views remain consistent
5. verify 3D reflects the same design when implemented

Never accept a state where 2D and 3D silently disagree.

## Evidence

For important findings capture:

- screenshot
- console evidence
- network evidence
- reproduction steps

Use evidence instead of assumptions.

## Result

Return:

### PASS

All tested flows work as expected.

### PASS WITH FINDINGS

The core flow works but non-blocking issues remain.

### FAIL

A blocking functional, security, persistence, or data-consistency
issue exists.

Do not modify application code during this review unless explicitly
asked to fix the identified issue.
