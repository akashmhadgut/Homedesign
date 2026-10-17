---
trigger: always_on
---

# Residential Design Domain Rules

## Product scope

This application is a conceptual residential space-planning
and visualization platform.

It helps users create, compare, edit and visualize residential
home concepts.

It is not automatically a replacement for:

- licensed architectural design
- structural engineering
- electrical engineering
- plumbing engineering
- legal property surveying
- statutory approval processes

Generated designs must not be represented as professionally
certified or authority-approved unless such a professional
workflow is explicitly implemented and verified.

---

## Canonical House Design Model

The House Design Model is the single source of truth.

It must be capable of representing:

- Plot
- Site
- Rooms
- Walls
- Doors
- Windows
- Staircases
- Furniture
- Dimensions
- Orientation
- Constraints
- Preferences
- Future expansion requirements
- Design versions

All major product outputs must derive from the same model:

- 2D floor plan
- 2D editor
- plan analysis
- 3D model
- 3D viewer
- walkthrough
- export
- client review

Never maintain separate authoritative versions of the house
for 2D and 3D.

---

## Hard Constraints vs Soft Preferences

Every design requirement must be classified as either:

### HARD CONSTRAINT

A condition that must be satisfied.

Examples:

- geometry must remain inside the allowed buildable area
- rooms must not overlap
- minimum room dimensions must be satisfied
- required rooms must exist
- required rooms must be reachable
- doors must belong to valid wall openings
- windows must belong to valid wall openings
- geometry must remain valid
- required entrance must exist
- required staircase must exist when selected

### SOFT PREFERENCE

A condition that the layout should try to satisfy.

Examples:

- Vastu preferences
- morning sunlight
- ventilation preference
- preferred room locations
- preferred room sizes
- future expansion preference
- privacy preference
- style preference

Soft preferences must not silently override hard constraints.

If preferences conflict with hard constraints, preserve the
hard constraints and report the trade-off.

---

## Vastu

Vastu must be treated as a user-selected traditional design
preference system.

Do not represent Vastu as scientifically validated.

Different Vastu traditions and practitioners may use different
rules.

Therefore:

- Vastu rules should be configurable
- Vastu should preferably influence scoring/preferences
- Vastu should not silently invalidate a geometrically valid
  design unless the user explicitly selected a strict rule set

The application should explain relevant trade-offs when needed.

---

## Sunlight and ventilation

Sunlight and ventilation should initially be treated as
planning analysis and preferences rather than guaranteed
physical simulation.

The system may evaluate:

- orientation
- window placement
- room exposure
- approximate morning sunlight preference
- external wall access

Do not claim exact sunlight behavior without appropriate
environmental/site data.

---

## Site images

Uploaded site images may be used to identify possible visible
features such as:

- trees
- walls
- existing structures
- poles
- access areas
- other visible obstacles

Image interpretation is not an official land survey.

When a detected feature materially affects planning, the system
should ask the user to confirm it.

Never silently assume exact:

- dimensions
- distances
- property boundaries
- legal ownership boundaries

from an ordinary photograph.

---

## Plot geometry

The design engine must support the concept of:

- rectangular plots
- square plots
- irregular plots
- future polygonal plot support

Plot geometry must remain explicit and measurable.

Do not assume every property is a simple rectangle.

---

## Room geometry

Rooms must contain explicit geometry and dimensions.

Room placement must respect:

- plot/buildable boundary
- required clearances
- room-size constraints
- adjacency requirements
- accessibility/circulation requirements

A visually attractive arrangement is not considered valid
unless its underlying geometry is valid.

---

## Openings

Doors and windows are part of the house geometry.

They must:

- belong to valid walls
- maintain valid dimensions
- not create impossible wall geometry
- remain synchronized with 2D and 3D representations

Moving a wall may require related doors/windows to be updated
or validated.

---

## Circulation

The design engine must consider whether required spaces are
actually reachable.

Examples:

- entrance to hall
- hall to bedroom
- hall to kitchen
- bedroom to bathroom
- access to staircase

A room that exists geometrically but cannot be practically
reached is not considered a valid layout.

---

## Future expansion

Future rooms/floors must be represented as planning requirements,
not as automatically guaranteed structural feasibility.

The system may reserve:

- expansion areas
- staircase access
- future room zones
- service/plumbing planning zones

But it must not claim that a future floor is structurally safe
without appropriate structural engineering verification.

---

## Layout generation

The deterministic layout engine is authoritative for geometry.

The AI must not directly generate final room coordinates
and persist them as trusted geometry.

The preferred flow is:

User language
→ AI requirement extraction
→ structured design intent
→ schema validation
→ domain/business validation
→ deterministic layout generation
→ layout validation
→ House Design Model

---

## AI modification requests

When the user says things such as:

"Make the bedroom bigger."

"Move the kitchen toward the east."

"Move the staircase outside."

the AI should translate the request into a controlled
design action.

The design engine must then validate and apply that action.

AI-generated actions must not bypass:

- geometry validation
- hard constraints
- authorization
- versioning

---

## Layout quality

A layout should not be considered successful merely because it
fits mathematically.

The system should also consider, where applicable:

- circulation
- room proportions
- accessibility
- privacy
- furniture clearance
- door usability
- window placement
- ventilation
- sunlight preferences
- future expansion
- user priorities

---

## Professional terminology

Use terms such as:

- Concept Plan
- Preliminary Design
- Space Planning
- 2D Floor Plan
- 3D Visualization
- Client Preview

Do not automatically use:

- Construction-ready
- Structurally certified
- Authority approved
- Legally surveyed

unless the relevant professional process actually exists.
