import { HouseDesign } from '../design/HouseDesign';

export interface DesignVersion {
  id: string;
  projectId: string;
  sourceDraftRevision: number;
  versionNumber: number;
  label?: string;
  snapshot: HouseDesign; // Complete immutable snapshot
  createdBy: string;
  createdAt: string;
  metadata: Record<string, any>;
}
