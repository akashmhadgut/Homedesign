import { HouseDesign, HardConstraint, SoftPreference, Plot, Polygon } from '@aihome/domain';

export interface CompiledConstraintSet {
  plot: Plot;
  buildableRegion: Polygon;
  requiredRooms: { id: string; type: string; minArea: number }[];
  hardConstraints: HardConstraint[];
  softPreferences: SoftPreference[];
}

export type FeasibilityFailureCode =
  | 'INSUFFICIENT_BUILDABLE_AREA'
  | 'ROOM_MINIMUMS_EXCEED_CAPACITY'
  | 'CONTRADICTORY_REQUIREMENTS'
  | 'INVALID_INPUT';

export interface FeasibilityResult {
  feasible: boolean;
  code?: FeasibilityFailureCode;
  reason?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PreferenceEvaluation {
  preferenceId: string;
  status: 'SATISFIED' | 'PARTIAL' | 'UNSATISFIED' | 'NOT_APPLICABLE';
  evidence: string[];
}

export interface GeneratedConcept {
  conceptId: string;
  strategy: string;
  houseDesign: HouseDesign;
  hardValidation: ValidationResult;
  preferenceEvaluations: PreferenceEvaluation[];
}

export interface ConceptGenerationResult {
  requestId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'NO_FEASIBLE_CONCEPT' | 'ENGINE_FAILURE' | 'INPUT_INVALID';
  engineVersion: string;
  seed: string;
  concepts: GeneratedConcept[];
  failures: string[];
  diagnostics?: any;
}
