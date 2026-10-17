import { HouseDesign } from '@aihome/domain';

export class DimensionProportionChecker {
  public static check(design: HouseDesign): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const room of design.rooms) {
      if (!room.derivedPolygon || room.derivedPolygon.vertices.length < 4) continue;
      
      const xs = room.derivedPolygon.vertices.map(v => v.x);
      const ys = room.derivedPolygon.vertices.map(v => v.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const depth = Math.max(...ys) - Math.min(...ys);

      const minDim = Math.min(width, depth);
      const maxDim = Math.max(width, depth);
      const ratio = minDim > 0 ? maxDim / minDim : 0;
      const rType = (room.type as string).toUpperCase();

      // 1. Bathroom Proportions Check
      if (rType.includes('BATH') || rType.includes('TOILET')) {
        if (minDim < 1400) {
          warnings.push(`BATHROOM_TOO_NARROW: ${room.name || room.type} width ${minDim}mm is narrower than practical 1400mm code standard.`);
        }
        if (ratio > 2.0) {
          warnings.push(`BATHROOM_TUNNEL_RATIO: ${room.name || room.type} aspect ratio ${ratio.toFixed(2)}:1 is an awkward hallway shape rather than a practical rectangular bathroom.`);
        }
      }

      // 2. Bedroom Proportions Check
      if (rType.includes('BED')) {
        if (minDim < 2800) {
          warnings.push(`BEDROOM_TOO_NARROW: ${room.name || room.type} dimension ${minDim}mm is narrower than practical 2800mm clearance for a bed.`);
        }
        if (ratio > 2.2) {
          warnings.push(`BEDROOM_NARROW_ASPECT: ${room.name || room.type} aspect ratio ${ratio.toFixed(2)}:1 is disproportionate.`);
        }
      }

      // 3. Living Room Proportions Check
      if (rType.includes('LIV') || rType.includes('HALL')) {
        if (minDim < 3200) {
          warnings.push(`LIVING_ROOM_TOO_NARROW: ${room.name || room.type} width ${minDim}mm is narrower than recommended 3200mm for comfortable seating and circulation.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
