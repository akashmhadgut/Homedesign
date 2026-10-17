export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type WorkspaceType = 'PERSONAL' | 'COMPANY';

export interface Workspace {
  id: string;
  type: WorkspaceType;
  name: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  status: ProjectStatus;
  clientName?: string;
  address?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
