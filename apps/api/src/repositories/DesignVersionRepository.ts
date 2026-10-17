import { prisma } from '@aihome/database';
import { DesignVersion } from '@prisma/client';
import { HouseDesign } from '@aihome/domain';

export class DesignVersionRepository {
  /**
   * Save a new design version snapshot for a project.
   */
  public static async saveVersion(projectId: string, designData: HouseDesign): Promise<DesignVersion> {
    // Transaction to get the next version number and create the version
    return prisma.$transaction(async (tx) => {
      const latestVersion = await tx.designVersion.findFirst({
        where: { projectId },
        orderBy: { version: 'desc' },
      });

      const nextVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

      // Type cast to any because Prisma Json type is somewhat strict, but it takes raw JS objects
      return tx.designVersion.create({
        data: {
          projectId,
          version: nextVersionNumber,
          designData: designData as any,
        },
      });
    });
  }

  /**
   * Lists all versions for a project.
   */
  public static async listByProject(projectId: string): Promise<DesignVersion[]> {
    return prisma.designVersion.findMany({
      where: { projectId },
      orderBy: { version: 'desc' },
      // Exclude the heavy JSON blob for list views to save bandwidth
      select: {
        id: true,
        projectId: true,
        version: true,
        createdAt: true,
      }
    }) as unknown as DesignVersion[];
  }

  /**
   * Get a specific version with its full geometry data.
   */
  public static async getVersionWithData(projectId: string, versionId: string): Promise<DesignVersion | null> {
    return prisma.designVersion.findFirst({
      where: { 
        id: versionId,
        projectId 
      },
    });
  }
}
