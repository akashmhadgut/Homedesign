export type RequirementPriority = 'MUST' | 'SHOULD' | 'NICE_TO_HAVE';

export interface Requirement {
  id: string;
  projectId: string;
  category: string;
  statement: string;
  priority: RequirementPriority;
  source: 'USER' | 'AI' | 'SYSTEM';
  createdAt: string;
  updatedAt: string;
}
