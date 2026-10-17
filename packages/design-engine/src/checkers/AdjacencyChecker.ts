import { HouseDesign } from '@aihome/domain';

export class AdjacencyChecker {
  public static check(design: HouseDesign): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rooms = design.rooms || [];
    const kitchen = rooms.find(r => (r.type as string).toUpperCase().includes('KITCH'));
    const dining = rooms.find(r => (r.type as string).toUpperCase().includes('DIN'));

    const getBounds = (r: any) => {
      const xs = r.derivedPolygon.vertices.map((v: any) => v.x);
      const ys = r.derivedPolygon.vertices.map((v: any) => v.y);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };
    };

    const doRoomsShareWall = (rA: any, rB: any): boolean => {
      if (!rA?.derivedPolygon || !rB?.derivedPolygon) return false;
      const a = getBounds(rA);
      const b = getBounds(rB);

      // Shared vertical wall
      const touchVertical = (Math.abs(a.maxX - b.minX) < 150 || Math.abs(b.maxX - a.minX) < 150);
      const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
      if (touchVertical && overlapY > 500) return true;

      // Shared horizontal wall
      const touchHorizontal = (Math.abs(a.maxY - b.minY) < 150 || Math.abs(b.maxY - a.minY) < 150);
      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
      if (touchHorizontal && overlapX > 500) return true;

      return false;
    };

    // 1. Kitchen to Dining Adjacency Check
    if (kitchen && dining) {
      const adjacent = doRoomsShareWall(kitchen, dining);
      if (!adjacent) {
        warnings.push('KITCHEN_DINING_DISCONNECTED: Gourmet Kitchen does not share a direct serving partition with Formal Dining Hall.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
