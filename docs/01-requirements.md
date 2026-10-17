# Product Requirements Document

## 1. Product Scope

(Mandatory) The AI Home Designer is an AI-assisted residential concept-design and visualization platform. It allows users to input natural language requirements, generate mathematically valid architectural concepts, and transition smoothly into 2D editing and 3D visualization.
(Mandatory) The product focuses on conceptual design and collaborative review, explicitly omitting structural engineering, legal surveying, and final construction-ready blueprints.

## 2. User Roles

- **Homeowner** (Mandatory): An individual creating or reviewing a conceptual design for their own home.
- **Builder** (Mandatory): A construction professional generating initial concepts and managing client approvals.
- **Contractor** (Optional): A specialist executing building tasks, using the tool to understand design intent.
- **Architect** (Mandatory): A licensed professional using the platform for rapid conceptualization before CAD workflows.
- **Engineer** (Optional): A technical specialist using exported geometry as a starting point.
- **Company Admin** (Mandatory): A B2B user managing team access, billing, and organizational settings.
- **Team Member** (Mandatory): A professional user operating under a B2B company account.
- **Client/Reviewer** (Mandatory): A read-only or limited-access user (usually a homeowner) invited by a professional to review and comment.

## 3. Project Lifecycle

(Mandatory)

1.  **Initiation**: Project creation, site definition, and natural language requirement gathering.
2.  **AI Briefing**: AI structures requirements into a formal, validated brief.
3.  **Concept Generation**: Deterministic engine produces valid layout alternatives.
4.  **Refinement**: 2D editing, constraint validation, and versioning.
5.  **Visualization**: Instant 3D rendering and walkthrough.
6.  **Review**: Secure sharing with clients for feedback.
7.  **Handoff**: Exporting the canonical model data.

## 4. Project Setup Requirements

- **Requirement**: Mandatory
- **Purpose**: Initialize a new residential design project.
- **User Input**: Project name, description, client details (Optional).
- **System Behavior**: Creates a new project container and initializes the canonical House Design Model.
- **Expected Output**: A unique, persistent project dashboard.
- **Validation**: Project name must not be empty.
- **Error Cases**: Name collision, database failure.
- **Permissions**: Any authenticated user.
- **Important Edge Cases**: Handling concurrent project creation.
- **Acceptance Criteria**: User can successfully create and view a new project dashboard.

## 5. Plot & Site Requirements

- **Requirement**: Mandatory
- **Purpose**: Define the physical boundaries and environment of the buildable area.
- **User Input**: Plot dimensions, setbacks, orientation.
- **System Behavior**: Establishes the primary hard constraint boundary within the model.
- **Expected Output**: A defined plot boundary visualized in 2D.
- **Validation**: Dimensions must be positive; setbacks must not exceed total dimensions.
- **Error Cases**: Invalid geometry.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Highly irregular polygonal plots (Future).
- **Acceptance Criteria**: System rejects negative dimensions and correctly displays the valid plot in 2D.

## 6. Home Requirements

- **Requirement**: Mandatory
- **Purpose**: Capture user intent via natural language.
- **User Input**: Free-form text describing desired rooms, features, and sizes.
- **System Behavior**: Stores raw text and passes it to the AI module.
- **Expected Output**: Raw text log and triggered AI analysis.
- **Validation**: Text length within limits.
- **Error Cases**: Empty input, network timeout.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Extremely long or vague inputs.
- **Acceptance Criteria**: User can submit a text block up to max length without error.

## 7. AI Design Brief Requirements

- **Requirement**: Mandatory
- **Purpose**: Translate natural language into structured, validated design intent.
- **User Input**: Responses to clarification questions (if any).
- **System Behavior**: AI extracts rooms, sizes, and relationships.
- **Expected Output**: A structured JSON brief.
- **Validation**: Must conform strictly to the brief schema (valid IDs, enums).
- **Error Cases**: Unparseable AI response, schema validation failure.
- **Permissions**: System-level (invoked by user action).
- **Important Edge Cases**: AI hallucinates non-existent room types; system must reject.
- **Acceptance Criteria**: The system parses valid natural language into a schema-compliant JSON brief or prompts for clarification.

## 8. Design Preferences Requirements

- **Requirement**: Mandatory
- **Purpose**: Capture soft constraints and stylistic choices.
- **User Input**: Vastu settings, sunlight priorities, style toggles (Optional).
- **System Behavior**: Updates the preference object in the model.
- **Expected Output**: Saved preference profile.
- **Validation**: Enum values must match allowed lists.
- **Error Cases**: Invalid preference.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Preferences that contradict hard plot constraints.
- **Acceptance Criteria**: User can save preferences and they do not override hard constraints during generation.

## 9. Concept Generation Requirements

- **Requirement**: Mandatory
- **Purpose**: Produce multiple geometrically valid floor plans.
- **User Input**: Trigger command referencing the AI Brief and Preferences.
- **System Behavior**: Deterministic engine algorithmically packs rooms within the buildable area.
- **Expected Output**: Target of 5 distinct, mathematically valid 2D layout concepts (fewer if constraints make 5 impossible; configurable counts as Future).
- **Validation**: All generated rooms must fit within plot, non-overlapping, with valid dimensions.
- **Error Cases**: Layout impossible to resolve.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Over-constrained brief.
- **Acceptance Criteria**: Engine attempts to generate 5 distinct non-overlapping layouts fitting within the plot, yielding as many as mathematically possible, or gracefully reports failure if none fit.

## 10. Plan Analysis Requirements

- **Requirement**: Mandatory (Core Product Capability)
- **Purpose**: Evaluate generated concepts against constraints and preferences.
- **User Input**: Selection of a specific concept.
- **System Behavior**: Calculates circulation efficiency and analyzes Vastu preference satisfaction. Advanced environmental analysis (e.g. detailed thermal/sunlight simulation) is Future.
- **Expected Output**: Analytical report and preference satisfaction warnings.
- **Validation**: Accurate mathematical evaluation based on geometry.
- **Error Cases**: Missing geometry data.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Reporting trade-offs clearly.
- **Acceptance Criteria**: System displays plan analysis (e.g. circulation and Vastu preference satisfaction) based solely on the canonical geometry.

## 11. 2D Editor Requirements

- **Requirement**: Mandatory
- **Purpose**: Allow manual refinement of the chosen concept.
- **User Input**: Drag-and-drop actions on walls, doors, windows, and rooms.
- **System Behavior**: Modifies the canonical House Design Model, re-running validation rules.
- **Expected Output**: Updated, valid 2D floor plan.
- **Validation**: No overlapping rooms, walls must connect, openings on valid walls.
- **Error Cases**: Invalid drag action (e.g., room dragged outside plot).
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Snapping logic.
- **Acceptance Criteria**: Editor rejects actions that cause overlapping rooms or breach plot boundaries, ensuring geometry remains valid.

## 12. Versioning Requirements

- **Requirement**: Mandatory
- **Purpose**: Track and manage design iterations.
- **User Input**: "Save Version" command.
- **System Behavior**: Creates an immutable snapshot.
- **Expected Output**: A new version listed in history.
- **Validation**: Must represent a valid model state.
- **Error Cases**: Storage failure.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Restoring old versions.
- **Acceptance Criteria**: User can save a snapshot and reload it, restoring the model to the exact saved state.

## 13. 3D Preview Requirements

- **Requirement**: Mandatory
- **Purpose**: Instantly visualize the canonical 2D model in 3D.
- **User Input**: "View in 3D" command.
- **System Behavior**: Generates 3D meshes dynamically from the 2D canonical data.
- **Expected Output**: An interactive 3D view.
- **Validation**: 3D representation must perfectly match 2D.
- **Error Cases**: WebGL failure.
- **Permissions**: All users with project access.
- **Important Edge Cases**: Complex multi-wall intersections.
- **Acceptance Criteria**: 3D view renders reflecting the exact current 2D canonical state.

## 14. Walkthrough Requirements

- **Requirement**: Mandatory
- **Purpose**: Provide a first-person immersive experience.
- **User Input**: Keyboard/mouse/touch navigation.
- **System Behavior**: Handles camera collision.
- **Expected Output**: Smooth navigation.
- **Validation**: Camera must not clip through walls.
- **Error Cases**: Performance drops.
- **Permissions**: All users with project access.
- **Important Edge Cases**: Getting stuck in narrow spaces.
- **Acceptance Criteria**: User navigates in 3D without walking through solid geometry.

## 15. Site Image / Site Intelligence Requirements

- **Requirement**: Future
- **Purpose**: Assist in plot definition using site photos.
- **User Input**: Image uploads.
- **System Behavior**: Analyzes images for potential obstacles.
- **Expected Output**: Suggested obstacle markers.
- **Validation**: User must explicitly confirm markers.
- **Error Cases**: Image unreadable.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: False positives.
- **Acceptance Criteria**: Image analysis must require explicit user confirmation before modifying the canonical model. Site analysis is clearly marked as assistive, not a legal survey.

## 16. Vastu Requirements

- **Requirement**: Mandatory (as a preference system)
- **Purpose**: Provide traditional preference analysis.
- **User Input**: Selection of Vastu strictness/profile.
- **System Behavior**: Performs preference satisfaction analysis based on geometry, generating unmet preference warnings. Optional configurable numerical scoring is Future.
- **Expected Output**: Unmet preference warnings and preference satisfaction breakdown.
- **Validation**: Evaluated purely against geometry.
- **Error Cases**: N/A
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: Contradicting hard constraints.
- **Acceptance Criteria**: Vastu warnings are displayed for unmet preferences but do not prevent saving or exporting a geometrically valid design unless strict mode is enabled.

## 17. Sunlight / Ventilation Requirements

- **Requirement**: Optional (Basic), Future (Advanced)
- **Purpose**: Estimate basic environmental performance.
- **User Input**: Orientation setup.
- **System Behavior**: Evaluates window placement vs orientation for basic exposure rating. Advanced thermal/sunlight simulation is Future.
- **Expected Output**: Simple exposure rating.
- **Validation**: Based on 2D window data.
- **Error Cases**: Missing orientation.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: N/A
- **Acceptance Criteria**: System reports exposure based strictly on window/wall orientation.

## 18. Client Review / Sharing Requirements

- **Requirement**: Mandatory
- **Purpose**: Enable professional users to share designs securely.
- **User Input**: Share action.
- **System Behavior**: Generates secure read-only/comment link using scoped, revocable access tokens.
- **Expected Output**: Presentation interface.
- **Validation**: Valid scoped access tokens with limited permissions.
- **Error Cases**: Invalid link.
- **Permissions**: Professionals share; Clients view.
- **Important Edge Cases**: Revoking link access immediately cuts off sharing.
- **Acceptance Criteria**: Client can load the design using a secure link, view it, but is blocked by backend authorization from modifying the canonical geometry.

## 19. Export Requirements

- **Requirement**: Mandatory (PDF, JSON), Future (DXF)
- **Purpose**: Output canonical data for professional handoff.
- **User Input**: Select export format (PDF, JSON).
- **System Behavior**: Translates model into format.
- **Expected Output**: Downloadable file.
- **Validation**: Accurate reflection of the canonical model.
- **Error Cases**: Conversion failure.
- **Permissions**: Project owners, team members.
- **Important Edge Cases**: N/A
- **Acceptance Criteria**: Exported PDF/JSON files download correctly and match the on-screen canonical model exactly.

## 20. Professional Dashboard Requirements

- **Requirement**: Mandatory
- **Purpose**: Centralized project management.
- **User Input**: Search, filter, create project.
- **System Behavior**: Aggregates project metadata.
- **Expected Output**: Categorized project list.
- **Validation**: Pagination, secure retrieval.
- **Error Cases**: DB timeout.
- **Permissions**: Professionals, Admins.
- **Important Edge Cases**: User in multiple companies.
- **Acceptance Criteria**: Dashboard successfully lists all and only the projects the user is authorized to access.

## 21. Team / Company Workspace Requirements

- **Requirement**: Mandatory
- **Purpose**: Manage B2B organization members.
- **User Input**: Invite/remove user, assign role.
- **System Behavior**: Updates RBAC.
- **Expected Output**: Updated member list.
- **Validation**: Cannot remove last Admin.
- **Error Cases**: Invalid email.
- **Permissions**: Company Admins.
- **Important Edge Cases**: Deleted users' projects retained by company.
- **Acceptance Criteria**: Admins can successfully add/remove members, and role-based permissions are enforced.

## 22. Usage / Billing Requirements

- **Requirement**: Usage Tracking (Mandatory), Billing Integrations (Future / Phase 4)
- **Purpose**: Track platform usage and manage subscriptions.
- **User Input**: View usage metrics (Future: Payment details, plan selection).
- **System Behavior**: Tracks counts of projects/exports (Future: Interfaces with payment gateway).
- **Expected Output**: Usage metrics dashboard (Future: Active subscription status).
- **Validation**: Usage limits validation.
- **Error Cases**: Exceeding usage quota.
- **Permissions**: Company Admins, Homeowners.
- **Important Edge Cases**: N/A
- **Acceptance Criteria**: System accurately increments usage counters for tracked resources (projects, exports).

## 23. Homeowner User Journey

(Mandatory)

1. Signs up and creates personal project.
2. Inputs plot dimensions and text requirements.
3. Reviews AI-generated brief.
4. Generates concepts and selects one.
5. Views 2D plan and walks through in 3D.
6. Edits in 2D editor or via natural language AI commands.
7. Exports summary PDF.

## 24. Professional User Journey

(Mandatory)

1. Logs into Dashboard, creates client project.
2. Inputs client's rough requirements.
3. Generates layout concepts.
4. Refines in 2D Editor, saves versions.
5. Generates Client Review link.
6. Receives approval, exports JSON/PDF.

## 25. Client Review Journey

(Mandatory)

1. Clicks secure email link.
2. Views 2D layout and 3D walkthrough.
3. Leaves comments.
4. Approves concept.

## 26. AI Requirements

(Mandatory)

- Must extract entities from unstructured text.
- Must generate clarifying questions when intent is ambiguous.
- Must output structured design intent strictly conforming to schema.
- Must propose controlled design actions for the deterministic engine to execute.
- Must handle invalid/hallucinated AI responses by safely rejecting them and logging.
- **Constraint**: AI must never directly persist geometry or bypass domain validation.

## 27. Canonical House Design Model Requirements

(Mandatory)

- Single source of truth representing Plot, Rooms, Walls, Doors, Windows, Staircase, Furniture, Dimensions, Orientation, Constraints, Preferences, Future Expansion, and Versions.
- All 2D, 3D, and Analysis views must derive deterministically from this model.

## 28. Hard Constraints vs Soft Preferences

(Mandatory)

- **Hard Constraints**: Non-negotiable (e.g., plot boundary containment, no room overlaps). Violations invalidate the layout.
- **Soft Preferences**: Desirable (e.g., Vastu, sunlight). Unmet preferences do not invalidate the layout.
- If conflicts arise, hard constraints win.

## 29. Authentication / Authorization Requirements

(Mandatory)

- **Protected APIs**: All API endpoints modifying project data must require a valid authentication token and server-side authorization must verify ownership/rights.
- **Secure Sharing**: Client-review share links must use scoped, revocable access tokens for limited review permissions, completely separate from full authentication.
- Client-side role checks are for UX only, not security.

## 30. Data Privacy Requirements

(Mandatory)

- Multi-tenant isolation for B2B data.
- Compliance with standard data deletion requests.
- Scrubbing of PII in logs.

## 31. Audit / Change Tracking Requirements

(Mandatory)

- Critical actions (project creation, version saves, team invites, links) must be logged.
- Model version history acts as the primary design audit trail.

## 32. Performance Requirements

(Mandatory)
Performance targets must be treated as budgets depending on design complexity, device capability, and infrastructure, rather than absolute guarantees:

- AI Brief Generation: Target budget ~5 seconds for standard requests.
- Layout Concept Generation: Target budget ~10 seconds for standard complexity.
- 2D Editor: 60 FPS target for interaction on modern hardware.
- 3D Preview Load: Target budget ~3 seconds from 2D state on modern hardware.

## 33. Accessibility Requirements

(Mandatory)

- Keyboard accessible and screen-reader friendly core navigation.
- WCAG AA color contrast.
- Accessible alternatives for purely graphical actions where feasible.

## 34. Security Requirements

(Mandatory)

- AI output is treated as untrusted input.
- Prevent injection via prompt or file uploads.
- Secure scoped tokens for client sharing.

## 35. Non-Functional Requirements

(Mandatory)

- Modern web technologies: React + TypeScript frontend and Node.js + TypeScript backend.
- High availability targets.
- Horizontally scalable layout generation engine.

## 36. Explicit Non-Goals

(Mandatory)

- Structural engineering and load calculation.
- Legal land surveying.
- Authority approval and code compliance.
- Construction-ready blueprints.
- Pixel-based AI generative floor plans (hallucinations).

## 37. MVP Requirements

(Mandatory)
The Minimum Viable Product (MVP) focuses strictly on the core loop:

- Project Setup
- Plot Definition
- Home Requirements
- AI Design Brief
- Design Preferences
- Concept Generation
- Plan Analysis
- Basic 2D Editor
- 3D Preview
- PDF Export

## 38. Future Requirements

(Future)

- Billing integrations and payment gateways (Phase 4).
- Configurable concept generation counts (beyond the target 5).
- Advanced environmental analysis (detailed thermal/sunlight simulation).
- Configurable numerical scoring for Vastu.
- Site Image / Site Intelligence (obstacle detection).
- DXF/DWG CAD Exports.
- Complex polygonal plot support.
- Multi-story generation.

## 39. Requirements Review Notes

- **Open Question**: For the MVP, if the default target of 5 concepts cannot be met due to constraints, what is the minimum number of acceptable concepts generated before prompting the user to relax requirements?
- **Open Question**: For the Client Review flow, how granular should the scoped access tokens be? Should they expire after a specific time duration by default?
- **Open Question**: Does the Basic 2D Editor in the MVP need to support curved walls or non-orthogonal geometry?
