export interface HardConstraint {
  type: string;
  targetId?: string;
  rules: Record<string, any>;
}

export interface SoftPreference {
  type: string;
  targetId?: string;
  weight: number;
  rules: Record<string, any>;
}

export interface DesignIntent {
  schemaVersion: number;
  projectId: string;
  floorsRequested: number;
  rooms: { id: string; type: string; minArea?: number }[];
  hardConstraints: HardConstraint[];
  softPreferences: SoftPreference[];
  unresolvedQuestions: string[];
  sourceRequirementIds: string[];
}
