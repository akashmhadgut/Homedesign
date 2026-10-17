import { prisma } from '@aihome/database';
import { Project } from '@prisma/client';

export class ProjectRepository {
  /**
   * Finds a project ensuring the user has access to the workspace.
   */
  public static async findById(id: string, workspaceId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  /**
   * Lists projects for a workspace.
   */
  public static async listByWorkspace(workspaceId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Creates a new project in a workspace.
   */
  public static async create(workspaceId: string, name: string): Promise<Project> {
    return prisma.project.create({
      data: {
        workspaceId,
        name,
      },
    });
  }
}
