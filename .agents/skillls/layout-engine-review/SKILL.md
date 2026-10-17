---
name: layout-engine-review
description: Reviews residential floor-plan generation and modification logic for geometric validity, practical usability, constraints, and consistency with the canonical House Design Model.
---

# Layout Engine Review

Act as a senior computational-design engineer reviewing the
residential layout engine.

Do not modify application code during review.

The goal is not only to determine whether a layout fits
mathematically, but whether the underlying design model is
consistent, valid and practically usable.

## Canonical source of truth

The layout engine must operate on the canonical House Design Model.

Do not create a separate authoritative representation for:

- 2D
- 3D
- validation
- export

## Geometry checks

Verify:

- rooms remain inside allowed buildable boundaries
- rooms do not unintentionally overlap
- walls form valid geometry
- room dimensions are positive
- dimensions respect required limits
- openings belong to valid walls
- doors have valid placement
- windows have valid placement
- staircase geometry is valid
- geometry remains consistent after edits

## Plot checks

Verify:

- plot boundary is respected
- setbacks are respected when defined
- irregular plot geometry is handled correctly
- buildable area is calculated consistently
- orientation is stored consistently
- units are explicit and consistent

Never assume every plot is rectangular.

## Room checks

For each room verify:

- valid identity
- valid geometry
- valid dimensions
- valid location
- required room relationships
- required accessibility
- appropriate external-wall access where applicable

## Circulation checks

Verify practical connectivity such as:

- entrance → main living area
- living area → required rooms
- bedrooms → required bathroom access
- kitchen access
- staircase access
- other required circulation paths

A room that exists but cannot realistically be reached is invalid.

## Hard constraints

Hard constraints must never be violated merely to improve a
soft preference.

Examples:

- plot containment
- no invalid overlap
- minimum room dimensions
- required rooms
- valid circulation
- valid openings
- required entrance
- required staircase when selected

## Soft preferences

Treat these as preferences rather than absolute truth:

- Vastu
- sunlight
- ventilation
- preferred room locations
- room-size preference
- privacy
- future expansion
- design style

If preferences conflict with hard constraints:

1. Preserve hard constraints.
2. Optimize soft preferences where possible.
3. Report the trade-off.

## Vastu

Vastu is a configurable traditional preference system.

Do not represent it as scientific validation.

Do not reject a geometrically valid plan solely because a Vastu
preference is not satisfied unless the user explicitly selected
a strict Vastu rule profile.

## Sunlight

Do not claim exact sunlight behavior without adequate site and
environment information.

Use orientation and window exposure for approximate planning.

## Future expansion

Verify that future expansion requirements are represented in
the model.

Examples:

- future staircase
- reserved expansion area
- future room zones
- service/plumbing planning considerations

Do not claim structural feasibility of a future floor without
professional structural verification.

## Layout generation quality

Do not accept a layout solely because it mathematically fits.

Review:

- circulation
- room proportions
- door usability
- furniture clearance where modeled
- accessibility
- privacy
- window placement
- ventilation
- sunlight preference
- future expansion
- user priorities

## Layout modifications

Whenever a user changes:

- wall
- room size
- door
- window
- staircase
- room location

re-run all affected validation rules.

Do not allow invalid intermediate state to become the
authoritative saved design.

## Determinism

Where deterministic generation is expected, verify that the same
input and seed/configuration can reproduce the same result.

Do not introduce uncontrolled randomness into production layout
generation.

## Version safety

A layout modification must not silently overwrite the previous
approved design.

Changes should create or update an explicit design version
according to the approved versioning strategy.

## Output

Return:

### Geometry Findings

### Constraint Findings

### Circulation Findings

### Practical Design Findings

### Performance Findings

### Determinism Findings

### Versioning Findings

### Recommended Changes

### Decision

Decision must be:

- PASS
- PASS WITH FINDINGS
- FAIL

Do not modify code during this review.
