import { prisma } from '@aihome/database';
import { DesignVersion } from '@prisma/client';
import { HouseDesign } from '@aihome/domain';

export class DesignRepository {
  /**
   * Saves a canonical JSON snapshot of a generated HouseDesign.
   */
  public static async saveSnapshot(
    projectId: string,
    version: number,
    design: HouseDesign,
  ): Promise<DesignVersion> {
    return prisma.designVersion.create({
      data: {
        projectId,
        version,
        designData: design as any, // Store canonical object in jsonb
      },
    });
  }

  /**
   * Loads a canonical snapshot.
   */
  public static async getSnapshot(projectId: string, version: number): Promise<HouseDesign | null> {
    const record = await prisma.designVersion.findUnique({
      where: {
        projectId_version: {
          projectId,
          version,
        },
      },
    });

    if (!record) return null;

    return record.designData as any as HouseDesign;
  }
}
