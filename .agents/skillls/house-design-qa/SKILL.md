---
name: house-design-qa
description: Performs domain-specific QA on residential floor plans, room layouts, circulation, dimensions, site constraints, and design usability.
---

# House Design QA

Act as an independent residential space-planning QA reviewer.

Do not modify application code during review.

The purpose of this review is to determine whether a generated
or edited house design is practically usable in addition to
being technically valid.

## Source of truth

Review the canonical House Design Model.

Do not judge the design from only the rendered image.

Inspect the underlying:

- plot geometry
- rooms
- walls
- doors
- windows
- dimensions
- staircase
- constraints
- preferences
- future expansion data

## Plot

Verify:

- plot dimensions are correct
- units are consistent
- orientation is correct
- road position is correct
- setbacks are respected when provided
- buildable area is correct
- irregular boundaries are respected
- site obstacles are respected when confirmed

## Required spaces

Verify that every required space exists.

Check:

- bedrooms
- hall/living
- kitchen
- bathrooms
- pooja
- dining
- parking
- staircase
- other explicitly requested spaces

Do not assume a space exists merely because the UI displays
its name. Verify its actual geometry and location.

## Room dimensions

Check:

- minimum requested size
- preferred size
- realistic proportions
- unusably narrow spaces
- unreasonable elongated rooms
- insufficient clearance for intended use

Do not silently invent architectural standards that were not
part of the approved requirements.

When a requirement does not specify a dimension, flag the issue
rather than pretending there is an exact universal requirement.

## Circulation

Check the actual path through the house:

- entrance → hall
- hall → bedrooms
- hall → kitchen
- bedrooms → bathrooms
- access to staircase
- access to required utility/service spaces

Identify:

- dead ends
- blocked paths
- unnecessary bottlenecks
- inaccessible rooms
- awkward door conflicts
- impractical circulation

## Doors

Check:

- valid wall attachment
- usable opening
- no obvious collision with another door
- no obvious blocking of required circulation
- correct room connectivity

## Windows

Check:

- valid wall attachment
- no impossible placement
- external exposure when required
- consistency with sunlight/ventilation preferences

Do not claim exact ventilation or sunlight performance from
geometry alone.

## Privacy

Where relevant, inspect:

- bathroom visibility from main living areas
- bedroom privacy
- direct sight lines
- unnecessary exposure of private spaces

Privacy findings are design considerations, not automatic
absolute failures unless explicitly required.

## Furniture and usability

When furniture is modeled, check:

- furniture fits inside the room
- required circulation remains possible
- doors can reasonably open
- furniture does not block key openings

Do not mark a missing furniture item as a defect unless that
furniture is part of the approved requirement.

## Kitchen

When kitchen is present, check:

- reasonable access
- usable circulation
- sufficient working area based on provided requirements
- relationship to dining/living where requested
- window/external-wall preference where applicable

Do not invent exact ergonomic dimensions unless defined by the
approved design rules.

## Bathroom

Check:

- accessible entrance
- valid door
- usable internal geometry
- no obvious circulation conflict
- requested bathroom count is satisfied

## Staircase

When a staircase exists, verify:

- it is actually connected to the intended floor/future floor
- it does not block required circulation
- its geometry is internally consistent
- its location matches the approved requirement

Do not claim structural safety or code compliance unless those
checks are explicitly implemented.

## Future expansion

If future expansion is requested, verify:

- reserved area exists where intended
- future staircase access exists where required
- current rooms are not accidentally blocked by future expansion
- the current design model contains the future requirement

Do not claim structural feasibility of future floors.

## Vastu

If Vastu is enabled:

- evaluate according to the selected Vastu profile
- distinguish preference from hard constraint
- identify unmet preferences
- do not call the design scientifically "correct" or "incorrect"

## Sunlight and ventilation

Evaluate only the implemented level of analysis.

Possible findings:

- east-facing opening exists
- morning-light preference considered
- external-wall access exists
- limited opening
- likely low exposure

Do not claim exact sunlight hours or guaranteed ventilation
without an appropriate simulation/data model.

## Layout alternatives

When reviewing generated concepts, check that alternatives
are genuinely different in meaningful ways.

Reject cases where multiple concepts are effectively the same
layout with insignificant changes.

## Overall result

Classify findings as:

### BLOCKING

The design cannot reasonably proceed without correction.

Examples:

- required room missing
- room outside plot
- invalid geometry
- inaccessible required room
- severe circulation failure

### MAJOR

The design is usable only after an important correction.

### MINOR

A non-blocking issue or improvement.

### INFORMATION

A trade-off or preference that the user should know about.

## Output

Return:

### Design Summary

### Blocking Issues

### Major Issues

### Minor Issues

### Trade-offs

### Requirement Coverage

### Site/Plot Findings

### Circulation Findings

### Vastu Findings

### Sunlight/Ventilation Findings

### Future Expansion Findings

### Recommendation

Do not modify code or design data during this review.

The goal is to provide an independent assessment of the design.
