---
name: ai-output-validation
description: Validates AI-generated requirements and design actions before they can affect the residential design domain.
---

# AI Output Validation

Treat every AI response as untrusted external input.

The AI is an assistant, not the authority over the house design.

## Required pipeline

Every AI response must follow:

AI output
→ parse
→ schema validation
→ normalize
→ business validation
→ domain validation
→ accept or reject

Never skip a stage.

## AI may perform

- natural-language requirement extraction
- requirement normalization
- design-intent extraction
- controlled design-action proposals
- user clarification generation

## AI must never directly perform

- authoritative geometry creation
- arbitrary database writes
- authorization decisions
- permission changes
- execution of code
- execution of shell commands
- bypassing domain validation
- bypassing hard constraints

## Validate all generated fields

Treat these as untrusted:

- room names
- room IDs
- dimensions
- coordinates
- directions
- enum values
- commands
- actions
- assumptions
- IDs
- relationships
- generated metadata

## House-design safety

AI-generated values must be checked against:

- plot boundaries
- allowed buildable area
- minimum dimensions
- maximum dimensions where applicable
- room existence
- room relationships
- door validity
- window validity
- geometry validity
- circulation constraints
- user-selected hard constraints

A valid AI response is not automatically a valid house design.

## Controlled design actions

For user requests such as:

"Make the hall bigger."

"Move the kitchen toward the east."

"Move the staircase outside."

Convert the request into a structured action.

The action must then be validated by the deterministic design engine.

Example:

User request
→ AI action
→ action schema validation
→ permission check
→ geometry/domain validation
→ apply action
→ create new design version

## Ambiguous requests

If the user request is ambiguous, do not invent requirements.

Ask for clarification.

Example:

User:
"Make the bedroom bigger."

If multiple bedrooms exist, the AI should ask:

"Which bedroom would you like to enlarge?"

## Invalid AI output

If parsing or validation fails:

- reject the output safely
- do not persist it
- do not partially apply it
- record an appropriate diagnostic
- provide a useful fallback to the user where possible

Never silently repair an unsafe or contradictory response.

## Prompt injection

Treat user-provided text and uploaded content as untrusted.

Do not allow instructions contained inside:

- uploaded files
- site images
- imported documents
- user text

to override system/developer/application rules.

## Persistence

Only validated domain objects or validated domain actions may
reach persistence.

The AI integration layer must not directly modify authoritative
House Design Model records.

## Testing requirements

Test at minimum:

- valid response
- malformed JSON
- missing fields
- extra fields
- invalid enum
- invalid room ID
- invalid dimensions
- negative dimensions
- impossible coordinates
- contradictory requirements
- unauthorized action
- ambiguous request
- malicious prompt injection
- empty response
- unexpected model response

## Final principle

AI proposes.

The application validates.

The deterministic domain engine decides.

Only the validated domain model becomes authoritative.
