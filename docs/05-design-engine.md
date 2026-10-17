Design Engine Document

1. Purpose
   This document defines the deterministic residential layout and geometry engine for the AI Home Designer.
   The design engine is responsible for turning a validated `DesignIntent` plus validated plot/site constraints into one or more valid canonical `HouseDesign` candidates.
   It also provides the geometry and validation capabilities required by:
   concept generation
   2D editing validation
   plan analysis
   version restore validation
   3D scene derivation
   walkthrough navigation derivation
   export validation
   The engine is a deterministic domain component. It does not depend on React, Express, Prisma, Gemini, Three.js, browser APIs, or cloud infrastructure.

---

2. Core Principles
   2.1 Canonical geometry authority
   `HouseDesign` is the only authoritative design geometry representation.
   The engine may produce temporary candidate geometry during search, but only validated candidates may be converted into canonical `HouseDesign` state.
   2.2 Hard constraints always win
   A design that violates a hard constraint is not a valid concept.
   Hard constraints are never converted into warnings merely to increase the number of returned concepts.
   2.3 Soft preferences guide selection
   Soft preferences, including Vastu preferences and selected design preferences, influence candidate generation and evaluation but do not make an otherwise valid geometry invalid.
   The engine must clearly report unsatisfied soft preferences.
   2.4 Determinism
   Given the same:
   validated `DesignIntent`
   plot/site geometry
   engine version
   configuration
   random seed
   The engine must produce reproducible results.
   2.5 No silent semantic repair
   The engine may perform deterministic geometric normalization such as coordinate snapping within a configured tolerance, but it must not silently change explicit user requirements in a way that changes their meaning.
   2.6 Bounded complexity
   The MVP engine should use deterministic heuristic search rather than introducing a general-purpose constraint solver, SAT solver, or external optimization service.
   The architecture must allow a more advanced solver to be introduced later behind the same engine boundary.

---

3. Engine Boundary
   The engine exposes pure operations conceptually equivalent to:

```text
validateDesign(design, context)
compileConstraints(designIntent, plot, site)
generateConcepts(input, options)
analyzeDesign(design, context)
validateCommandResult(previousDesign, nextDesign, commandContext)
deriveNavigationData(design)
```

The engine must not:
access the database directly
make network calls
call an AI provider
perform authorization
persist files
mutate application state outside its returned values
depend on UI state
Application services own orchestration and persistence.
---

4. Inputs
   4.1 Plot input
   The engine consumes a validated plot definition including:
   outer boundary
   plot dimensions where applicable
   plot orientation
   road/access information
   mandatory setbacks
   optional buildable-area overrides
   plot tolerance metadata
   MVP should support rectangular and orthogonal plot boundaries. The geometry abstraction should permit future simple-polygon support without redesigning the engine API.
   4.2 Site input
   Relevant site inputs may include:
   north direction
   road side
   entrance/access side
   surrounding obstructions when modeled
   site observations that affect explicit constraints
   Advanced site-photo intelligence is outside the engine.
   4.3 DesignIntent input
   The engine receives a normalized, validated `DesignIntent`, including where applicable:
   number of floors
   required rooms
   optional rooms
   room count
   minimum/target room areas
   preferred room adjacencies
   required adjacencies
   circulation expectations
   entrance preference
   staircase requirement
   parking requirement
   orientation preferences
   Vastu preferences
   sunlight preferences supported by MVP
   future expansion requirement
   other explicit constraints
   AI-generated intent must already have passed schema, normalization, business, and domain validation before entering the engine.

---

5. Canonical Geometry Model Used by the Engine
   5.1 Coordinate system
   The engine uses the canonical domain coordinate system:
   X axis increases east/right
   Y axis increases north/up
   linear values are millimetres
   angles are degrees at the domain boundary
   All calculations use centralized numerical tolerance utilities.
   5.2 Authoritative wall topology
   For MVP, walls are the authoritative structural geometry primitives.
   A wall contains conceptually:

```text
Wall
- id
- floorId
- startPoint
- endPoint
- thickness
- topologyLinks
```

Room boundaries are represented as ordered boundary loops referencing wall segments. Room polygons are derived from those loops and are not an independent source of truth.
This prevents wall movement from leaving duplicate room geometry behind.
5.3 Openings
Doors and windows attach to a host wall using a stable wall reference plus a normalized/absolute position representation appropriate to the domain model.
The engine validates that:
the host wall exists
the opening lies within the usable wall span
the opening width is positive
opening extents do not cross incompatible wall topology
required clearances are satisfied
5.4 Staircases
A staircase has:
source floor
destination floor
footprint
stair type/configuration
direction/orientation
landing requirements where applicable
The engine validates the footprint, floor references, and basic circulation clearance rules defined for MVP.
5.5 Furniture
Furniture is a secondary spatial object.
The engine may place required or representative furniture after room allocation to verify approximate usable space and circulation.
Furniture does not define structural room boundaries.
---

6. Constraint Taxonomy
   Constraints are classified into explicit groups.
   6.1 Hard constraints
   Examples:
   plot/buildable-area containment
   mandatory setbacks
   minimum room dimensions
   required room existence
   required floor count
   mandatory staircase presence
   required adjacency where explicitly marked hard
   non-overlap rules
   wall and opening validity
   minimum circulation width where configured
   mandatory parking or access requirements where configured
   6.2 Soft preferences
   Examples:
   preferred orientation
   Vastu preferences
   preferred adjacency
   room placement preferences
   sunlight preferences supported by MVP
   future-expansion preference
   preferred entrance location
   Soft preferences affect generation and evaluation but are never allowed to create invalid geometry.
   6.3 Constraint priority
   When multiple constraints compete:

```text
Security / Geometry Integrity
        ↓
Hard Plot Constraints
        ↓
Hard Spatial Requirements
        ↓
Hard Functional Requirements
        ↓
Soft Preferences
        ↓
Concept Diversity Heuristics
```

The engine must never relax a higher-priority hard constraint to satisfy a lower-priority preference.
---

7. Constraint Compilation
   Before layout search, the input is converted into an internal `CompiledConstraintSet`.
   Conceptually:

```text
CompiledConstraintSet
- buildableRegion
- floors
- roomRequirements[]
- dimensionRules[]
- adjacencyRules[]
- circulationRules[]
- openingRules[]
- staircaseRules[]
- orientationPreferences[]
- vastuPreferences[]
- expansionRules[]
- generationOptions
```

Compilation performs:
requirement normalization
default application
contradiction checks
derived geometric calculations
constraint prioritization
deterministic ordering
If contradictory hard requirements are discovered, generation stops before search begins and returns a structured failure.
---

8. Feasibility Checking Before Generation
   The engine should perform a lightweight feasibility pass before attempting full concept generation.
   Examples:
   required total room area exceeds available buildable area
   required room minimum dimensions cannot fit inside the buildable envelope
   staircase minimum footprint cannot fit
   mandatory parking and required rooms cannot coexist within the specified buildable area
   required floor count contradicts a project constraint
   Feasibility failure should produce machine-readable reasons such as:

```text
INSUFFICIENT_BUILDABLE_AREA
ROOM_MINIMUMS_EXCEED_CAPACITY
STAIRCASE_CANNOT_FIT
REQUIRED_SETBACK_CONFLICT
CONTRADICTORY_REQUIREMENTS
```

The engine should report actionable evidence, including affected requirement IDs where available.
---

9. Layout Generation Pipeline
   The recommended MVP pipeline is:

```text
Validated DesignIntent
        ↓
Compile Constraints
        ↓
Feasibility Check
        ↓
Select Generation Strategies
        ↓
Allocate Major Zones
        ↓
Place Required Rooms
        ↓
Solve Adjacencies / Circulation
        ↓
Construct Wall Topology
        ↓
Place Doors / Windows / Staircase
        ↓
Place Representative Furniture
        ↓
Normalize Geometry
        ↓
Hard Validation
        ↓
Soft Preference Evaluation
        ↓
Diversity Check
        ↓
Canonical HouseDesign Candidate
```

A candidate that fails hard validation is discarded and must never be returned as a valid concept.
---

10. Generation Strategy Model
    Concept generation must not rely on random uncontrolled mutation.
    Instead, each concept uses a deterministic strategy profile derived from the base seed.
    Example strategy dimensions:

```text
StrategyProfile
- roomOrdering
- adjacencyPriority
- corridorStrategy
- entranceStrategy
- staircaseStrategy
- orientationBias
- expansionBias
```

Examples of deterministic strategy families:
Strategy A — Compact
Prioritize shorter circulation paths and compact room grouping.
Strategy B — Courtyard/Open
Where the requirements and plot permit, bias major spaces toward a more open central arrangement.
Strategy C — Privacy-oriented
Prioritize separation between public and private zones.
Strategy D — Orientation-oriented
Prioritize supported directional preferences while maintaining hard validity.
Strategy E — Expansion-oriented
Reserve explicit area or circulation access for future expansion where the requirement allows it.
These names describe engine strategies, not user-facing quality rankings.
---

11. Room Placement Algorithm
    The MVP room-placement algorithm should use deterministic heuristic search.
    Phase 1 — Room classification
    Rooms are classified into:
    public
    private
    service
    circulation/support
    optional/flexible
    Phase 2 — Priority ordering
    Required rooms are ordered using a deterministic priority function based on:
    hard dimension restrictions
    adjacency degree
    required floor
    circulation dependency
    staircase dependency
    More constrained rooms are generally placed before flexible rooms.
    Phase 3 — Candidate rectangles
    For orthogonal MVP layouts, candidate room footprints are generated as axis-aligned rectangles satisfying minimum and target dimensions.
    Each candidate is tested for:
    buildable-area containment
    collision
    required adjacency
    circulation feasibility
    setback rules
    Phase 4 — Incremental placement
    The engine places one room at a time and prunes branches that already violate a hard constraint.
    Phase 5 — Local improvement
    After an initial feasible arrangement exists, bounded deterministic local adjustments may improve:
    corridor efficiency
    target room dimensions
    soft preferences
    furniture fit
    expansion reserve
    The improvement loop has a fixed iteration budget.

---

12. Adjacency and Circulation
    12.1 Adjacency graph
    Requirements are compiled into an adjacency graph.

```text
AdjacencyRule
- roomA
- roomB
- relationship: REQUIRED | PREFERRED | FORBIDDEN
- weight?
```

The engine evaluates adjacency using a defined geometric relationship rather than visual closeness alone.
12.2 Circulation graph
The engine creates a simplified walkable graph after major rooms are placed.
Nodes may represent:
room entrances
corridor junctions
staircase landings
main entrance
Edges represent usable circulation paths.
12.3 Minimum circulation
Where the requirements define a minimum circulation width, the engine must validate the corridor/path against that threshold.
A design cannot be considered fully valid if the user explicitly required a circulation width and the generated geometry violates it.
---

13. Wall Topology Construction
    After room placement, the engine converts room boundaries into a coherent wall graph.
    13.1 Goals
    The generated wall topology must support:
    T-junctions
    endpoint connections
    shared walls
    exterior walls
    openings
    staircase boundaries
    13.2 Intersection normalization
    Collinear or coincident wall segments that are semantically the same boundary should be normalized into a deterministic representation.
    Intersections must not be represented only as visual crossings. They require explicit topology relationships where needed.
    13.3 MVP geometry scope
    MVP focuses on orthogonal wall geometry.
    Curved/non-orthogonal walls are not part of the initial generation scope, but the geometry interfaces should not hard-code assumptions that make future support impossible.

---

14. Door Placement
    Doors are placed after room connectivity exists.
    The algorithm must:
    identify required connections
    select valid host walls
    determine an opening position
    validate wall span and clearances
    ensure the door supports circulation between the intended spaces
    For MVP, door placement should prefer deterministic rules such as:
    near the logical room entrance region
    avoid corners by a configured clearance
    avoid conflicts with neighboring openings
    preserve required circulation width

---

15. Window Placement
    Windows are derived from room requirements, external walls, and supported orientation preferences.
    The engine must validate:
    host wall suitability
    window width
    edge clearance
    conflict with doors
    conflict with adjacent windows/openings
    Advanced daylight and solar calculations are not required for the MVP generation engine.

---

16. Staircase Placement
    The staircase is treated as a high-impact structural planning object within conceptual scope.
    Generation should:
    place the staircase before flexible secondary rooms are finalized when a staircase is mandatory
    reserve required footprint
    maintain minimum circulation around its access
    connect the required floor pair(s)
    reject layouts where the staircase cannot be accommodated
    The engine does not perform structural staircase design or certification.

---

17. Parking and External Requirements
    Where parking is part of the project requirements, it is modeled as a reserved spatial zone rather than a normal interior room.
    The engine validates:
    access from the appropriate site boundary
    required parking dimensions
    conflict with mandatory setbacks
    conflict with building footprint
    More advanced vehicle-turning simulation is a future extension.

---

18. Future Expansion
    When future expansion is requested, the engine may reserve one or more explicit expansion zones.
    An expansion zone must be represented as intentional metadata/space, not merely inferred from leftover empty area.
    The engine should report:
    reserved area
    candidate expansion location
    access/circulation assumptions
    conflicts that would prevent the intended future expansion

---

19. Geometry Validation
    Validation runs at multiple stages.
    19.1 Primitive validation
    Validate points, segments, polygons, dimensions, and finite values.
    19.2 Topology validation
    Validate wall connections, room boundary loops, opening hosts, staircase references, and floor references.
    19.3 Spatial validation
    Validate:
    overlap
    containment
    setbacks
    minimum dimensions
    circulation
    opening collisions
    19.4 Semantic validation
    Validate:
    required rooms exist
    required relationships exist
    floor assignments are correct
    mandatory features exist
    19.5 Preference evaluation
    Evaluate soft preferences separately so they cannot accidentally turn into hidden hard constraints.

---

20. Hard Validation Result
    Conceptually:

```text
ValidationResult
- valid: boolean
- errors[]
- warnings[]
- evidence[]
```

Hard failures must have stable codes.
Examples:

```text
PLOT_CONTAINMENT_FAILED
SETBACK_VIOLATION
ROOM_OVERLAP
ROOM_TOO_SMALL
CIRCULATION_TOO_NARROW
INVALID_WALL_TOPOLOGY
OPENING_OUTSIDE_WALL
STAIRCASE_FIT_FAILED
REQUIRED_ROOM_MISSING
REQUIRED_ADJACENCY_FAILED
```

Warnings must never be used to hide hard failures.
---

21. Soft Preference Evaluation
    Soft evaluation produces structured findings instead of a single opaque quality score.
    Conceptually:

```text
PreferenceEvaluation
- preferenceId
- status: SATISFIED | PARTIAL | UNSATISFIED | NOT_APPLICABLE
- evidence[]
```

This keeps user-facing explanations understandable and prevents the engine from presenting subjective preferences as objective architectural quality.
Vastu
Vastu is modeled as a configurable traditional design-preference system.
The engine may report which configured preferences are satisfied or unsatisfied.
The engine must not represent Vastu findings as scientific or regulatory facts.
---

22. Concept Diversity
    A concept set must contain meaningfully different geometry or strategy outcomes.
    22.1 Duplicate detection
    Two candidates are duplicates when their canonical geometry is equivalent within the defined geometry tolerance after deterministic normalization.
    22.2 Near-duplicate detection
    The engine should also detect near-duplicates using deterministic signatures based on selected structural features, such as:
    room centroid relationships
    major room dimensions
    adjacency graph
    entrance location
    staircase location
    room ordering
    22.3 Diversity rule
    The engine should attempt to return up to five distinct valid concepts.
    It may return fewer when:
    only fewer valid solutions exist
    additional candidates would be near-duplicates
    time/complexity budget is exhausted
    requirements are too restrictive
    The result must explain which condition occurred.

---

23. Deterministic Seeding
    Concept generation accepts an explicit seed.
    Recommended seed inputs:

```text
baseSeed = hash(
  project-independent normalized DesignIntent +
  plot geometry +
  engineVersion +
  callerSeed
)
```

A concept strategy derives its own deterministic sub-seed from the base seed.
The engine must never rely on ambient system time for geometry randomness.
---

24. Engine Versioning
    Layout algorithms can change over time. Therefore every generated concept should record:

```text
engineVersion
algorithmVersion
seed
configurationVersion
```

A historical `DesignVersion` remains reproducible from its saved canonical snapshot even if the engine later changes.
Regenerating concepts later may intentionally produce different results under a newer engine version.
---

25. Generation Output
    Concept generation returns a structured result:

```text
ConceptGenerationResult
- requestId
- engineVersion
- seed
- concepts[]
- failures[]
- diagnostics
```

Each concept contains:

```text
GeneratedConcept
- conceptId
- strategy
- houseDesign
- hardValidation
- preferenceEvaluation
- generationMetadata
```

A returned concept must already satisfy the canonical domain invariants.
The engine must not return partially valid geometry as a normal successful concept.
---

26. Partial Failure Handling
    The engine must distinguish:
    Input invalid
    The request cannot be processed because the input itself is invalid or contradictory.
    No feasible concept
    The input is valid, but no geometry satisfying hard constraints was found.
    Partial concept set
    One or more valid concepts were generated, but fewer than the requested maximum were found.
    Engine failure
    An unexpected internal failure occurred. This must be treated differently from a legitimate design infeasibility result.
    Example result:

```text
status: PARTIAL
conceptCount: 3
requestedCount: 5
reason: LIMITED_FEASIBLE_DIVERSITY
```

---

27. Search Limits and Guardrails
    The engine must use explicit resource limits.
    Configurable limits should include:
    maximum search branches
    maximum iterations per strategy
    maximum candidates held in memory
    maximum generation wall-clock budget
    maximum rooms/floors supported by the selected MVP configuration
    When a limit is reached, generation ends deterministically with a structured diagnostic rather than hanging indefinitely.
    Limits are safety and reliability controls, not substitutes for algorithm correctness.

---

28. Performance Strategy
    Initial MVP strategy:
    run deterministic generation in the API process for small/simple projects
    keep the engine synchronous and pure from the API's perspective
    measure real execution time and candidate counts
    move generation to a worker/background execution boundary only when observed workloads justify it
    If moved to workers later, the engine API and result contracts should remain unchanged.
    Target budgets are engineering goals, not absolute guarantees.
    A reasonable initial goal is to keep common small residential generation within roughly several seconds, with explicit timeout handling for larger cases.

---

29. Caching Strategy
    Caching is optional and must never change correctness.
    Potential cache key components:

```text
hash(
  normalized input,
  engineVersion,
  algorithm configuration,
  seed
)
```

A cache hit must return the same canonical result as a fresh deterministic execution.
Cache entries must not bypass authorization or expose another tenant's design data.
---

30. Editor Command Validation
    The same engine geometry validators used for generation are reused for user edits.
    Example:

```text
MoveWall
  ↓
Apply tentative mutation
  ↓
Primitive validation
  ↓
Topology validation
  ↓
Spatial validation
  ↓
Semantic validation
  ↓
Accept or reject
```

This prevents the editor from creating geometry that the generation engine itself would reject.
For performance, the editor may run lightweight client-side validation first, but the server remains authoritative.
---

31. Plan Analysis Integration
    Plan analysis consumes a validated canonical `HouseDesign` and produces a derived `DesignAnalysis`.
    The engine may provide analysis functions such as:

```text
calculateRoomAreas()
validateDimensions()
validateCirculation()
validateOpenings()
checkBuildableArea()
evaluatePreferences()
inspectFutureExpansion()
```

Analysis must never mutate the canonical design.
---

32. 3D Integration
    The engine provides a geometry projection suitable for the renderer.
    The projection may derive:
    wall centerlines and thicknesses
    room floor polygons
    door/window opening metadata
    staircase footprint
    furniture transforms
    floor extents
    3D-specific mesh data is disposable render data, not domain state.
    Complex mesh generation belongs in rendering adapters, not in the authoritative domain model.

---

33. Walkthrough Integration
    The engine may provide a derived navigation representation:

```text
NavigationGraph
- nodes[]
- edges[]
- blockedRegions[]
- floorLinks[]
```

This representation is generated from the canonical design and is not persisted as another source of truth unless cached as an explicitly derived artifact.
Collision geometry for walkthrough use may be simplified for performance as long as it remains safely derived from the canonical design.
---

34. Serialization Boundary
    The engine consumes and returns schema-validated domain objects.
    It must not use:
    Prisma models
    raw database rows
    React state objects
    Three.js objects
    browser event objects
    Serialization/deserialization occurs at application/infrastructure boundaries.

---

35. Error Model
    Engine errors are structured and machine-readable.
    35.1 Input errors

```text
INVALID_INPUT
INVALID_PLOT
INVALID_DESIGN_INTENT
UNSUPPORTED_GEOMETRY
```

35.2 Constraint errors

```text
CONTRADICTORY_REQUIREMENTS
INSUFFICIENT_BUILDABLE_AREA
SETBACK_CONFLICT
ROOM_MINIMUM_CAPACITY_FAILURE
REQUIRED_FEATURE_CANNOT_FIT
```

35.3 Search outcomes

```text
NO_FEASIBLE_CONCEPT
LIMIT_REACHED
INSUFFICIENT_DIVERSITY
PARTIAL_RESULT
```

35.4 Internal errors
Unexpected engine exceptions must be logged by the application boundary with correlation metadata. Internal stack traces must not be returned to end users.
---

36. Testing Strategy
    The design engine requires more rigorous testing than ordinary CRUD logic because incorrect geometry can propagate into every downstream view.
    36.1 Unit tests
    Test geometry primitives independently:
    distance
    intersection
    containment
    polygon area
    segment splitting
    wall offsets
    tolerance comparisons
    adjacency detection
    36.2 Invariant tests
    For every accepted generated design, assert:
    finite coordinates
    positive dimensions
    valid topology
    no forbidden overlap
    buildable-area compliance
    opening validity
    staircase validity
    required room presence
    36.3 Determinism tests
    Given the same input and seed:
    output count is stable
    geometry is stable
    validation findings are stable
    diagnostic reason is stable
    36.4 Golden tests
    Maintain a curated set of representative residential scenarios with expected normalized outputs or stable structural signatures.
    Golden tests should avoid brittle assertions on incidental object ordering.
    36.5 Property-based tests
    Generate randomized valid and invalid geometry and verify that:
    the engine does not crash
    NaN/Infinity does not propagate
    invalid geometry is rejected
    accepted geometry satisfies invariants
    36.6 Failure-case tests
    Include cases such as:
    plot too small
    contradictory room requirements
    impossible stair placement
    excessive setbacks
    impossible required adjacency
    insufficient circulation width
    opening outside host wall
    overlapping rooms
    36.7 Regression suite
    Every discovered production bug involving geometry should add a deterministic regression case before the fix is considered complete.

---

37. Observability
    The engine should emit structured diagnostics through the application boundary.
    Recommended fields:

```text
requestId
projectId
engineVersion
algorithmVersion
seed
roomCount
floorCount
candidateCount
validCandidateCount
durationMs
searchBranches
limitReached
failureReason
```

Do not log sensitive client content or raw share tokens.
AI prompt content should not be logged by the engine.
---

38. Security Boundary
    The engine itself is not an authorization boundary.
    The application service must authorize access before invoking it with project-specific data.
    The engine must nevertheless treat all supplied values as untrusted and validate them against domain limits to prevent:
    pathological coordinate values
    excessive polygon sizes
    runaway search inputs
    malformed nested data
    denial-of-service style computational explosions
    Explicit maximums must exist for input size and search complexity.

---

39. Domain and API Integration
    The API should expose engine operations through application services rather than directly calling engine functions from controllers.
    Example flow:

```text
HTTP Request
    ↓
Controller
    ↓
DTO validation
    ↓
Authorization
    ↓
Application Service
    ↓
Domain / Engine
    ↓
Repository transaction
    ↓
API response DTO
```

For concept generation:

```text
GenerateConcepts request
    ↓
Load project context
    ↓
Authorize access
    ↓
Load normalized DesignIntent
    ↓
Load plot/site context
    ↓
Compile constraints
    ↓
Generate concepts
    ↓
Validate returned candidates
    ↓
Persist valid concept/version artifacts through application service
```

The controller must not implement the generation algorithm.
---

40. Persistence Rules
    The engine does not own persistence.
    The application layer decides whether to persist:
    generated concepts
    active draft changes
    design versions
    analysis results
    engine diagnostics
    When an engine result is persisted, the following metadata should be preserved where relevant:
    engine version
    algorithm version
    seed
    source design-intent version/hash
    generation configuration version
    Historical versions must remain reproducible independently of future engine releases.

---

41. Configuration Strategy
    Engine configuration must be explicit and versioned.
    Examples:

```text
EngineConfig
- geometryToleranceMm
- minimumRoomWidthMm
- minimumRoomDepthMm
- minimumCirculationWidthMm
- defaultWallThicknessMm
- defaultDoorWidthMm
- defaultWindowWidthMm
- searchBranchLimit
- strategyIterationLimit
- generationTimeoutMs
```

Configuration must not be silently changed between environments when reproducibility matters.
Environment-specific values may override operational limits, but algorithmic configuration used for a saved design should be recorded when necessary to reproduce it.
---

42. MVP Scope
    The initial engine supports:
    orthogonal residential concepts
    one or more floors within configured MVP limits
    rectangular and supported orthogonal plot boundaries
    required and optional rooms
    hard spatial constraints
    basic adjacency
    basic circulation
    doors
    windows
    conceptual staircase footprints
    parking zone where required
    future expansion reservation
    Vastu preference evaluation
    basic sunlight/orientation preference evaluation where sufficient inputs exist
    up to five distinct valid concepts
    deterministic seeds
    structured failure explanations
    geometry validation for editor commands

---

43. Explicit Non-Goals
    The engine does not perform:
    structural engineering
    RCC/steel design
    reinforcement design
    architectural approval certification
    legal land survey
    detailed HVAC/plumbing/electrical engineering
    construction-cost estimation
    BIM-grade construction modeling
    fully realistic daylight simulation
    building-code compliance for every jurisdiction
    arbitrary free-form curved architecture in MVP
    autonomous construction decisions
    The product remains a conceptual residential planning and visualization system.

---

44. Future Extensions
    The engine boundary should support later additions such as:
    richer arbitrary-polygon plot support
    curved/non-orthogonal wall strategies
    advanced daylight and solar analysis
    slope/topography-aware placement
    road/vehicle turning simulation
    more sophisticated optimization/search
    learned ranking of heuristic strategies without giving AI direct geometry authority
    advanced accessibility analysis
    richer furniture and fixture libraries
    BIM/IFC export preparation
    specialized professional constraint packs
    Future extensions must preserve deterministic domain validation and the canonical model principle.

---

45. Architecture Invariants
    The following rules are mandatory:
    No invalid geometry enters the canonical `HouseDesign`.
    Hard constraints are never silently relaxed.
    AI never directly owns geometry.
    Rendering never becomes a second source of truth.
    Engine output is deterministic for fixed version/configuration/seed/input.
    Engine logic is independent of persistence and UI frameworks.
    The same geometry invariants apply to generated designs and edited designs.
    Historical design versions remain immutable.
    Soft preferences are reported separately from hard validity.
    Search limits prevent uncontrolled computational growth.

---

46. Recommended Implementation Order
    After architecture and domain approval, implementation should proceed in this order:
    Geometry value objects and numerical tolerance utilities.
    Primitive geometry operations.
    Wall topology and room-boundary representation.
    Domain validation/invariant checks.
    Constraint compilation.
    Feasibility analysis.
    Deterministic room-placement strategies.
    Adjacency and circulation validation.
    Wall topology construction.
    Door/window/staircase placement.
    Hard-validation pipeline.
    Soft-preference evaluation.
    Candidate diversity/deduplication.
    Five-concept generation orchestration.
    Engine diagnostics and version metadata.
    Domain/editor command validation integration.
    Plan-analysis integration.
    Property-based, golden, regression, and determinism test suites.
    Do not begin 2D or 3D implementation until the core geometry primitives, validation rules, and generation contracts are stable.

---

47. Design Engine Open Questions
    The following decisions should be resolved before the first production implementation where they materially affect algorithms:
    Exact MVP limits for number of floors, rooms, furniture items, and search branches.
    Exact default geometry tolerances and minimum dimensions for each supported room/element type.
    Exact required adjacency semantics for different relationship types.
    Exact MVP circulation model and minimum width rules.
    Exact staircase rule set supported for conceptual planning.
    Exact parking dimensions and access assumptions for supported vehicle types.
    Exact supported orthogonal plot polygon representation.
    Whether advanced sunlight calculations remain outside MVP generation and are analysis-only in the first release.
    Whether generated concepts are persisted immediately or only when promoted into project design versions.
    Exact golden scenario set for the initial regression suite.
    These questions are intentionally bounded. They do not block defining the core engine interfaces, geometry primitives, validation architecture, or deterministic search framework.
