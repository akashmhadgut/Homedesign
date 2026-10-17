import { HouseDesign } from '@aihome/domain';

export class VentilationChecker {
  public static check(design: HouseDesign): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!design.rooms || design.rooms.length === 0) return { valid: true, errors, warnings };

    // Find the outer perimeter bounding box of the entire house layout
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const room of design.rooms) {
      if (!room.derivedPolygon) continue;
      for (const v of room.derivedPolygon.vertices) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      }
    }

    // Check each sanitary room (Bathrooms, Toilets, Utility) and habitable rooms (Bedrooms)
    for (const room of design.rooms) {
      if (!room.derivedPolygon) continue;
      const rType = (room.type as string).toUpperCase();
      const isSanitary = rType.includes('BATH') || rType.includes('TOILET') || rType.includes('UTIL');
      const isHabitable = rType.includes('BED') || rType.includes('LIV') || rType.includes('KITCH');

      if (!isSanitary && !isHabitable) continue;

      // Check if at least one side touches the outer perimeter wall (within 150mm margin)
      const touchesExterior = room.derivedPolygon.vertices.some(v => 
        Math.abs(v.x - minX) < 150 || 
        Math.abs(v.x - maxX) < 150 || 
        Math.abs(v.y - minY) < 150 || 
        Math.abs(v.y - maxY) < 150
      );

      if (!touchesExterior) {
        if (isSanitary) {
          warnings.push(`LANDLOCKED_SANITARY: ${room.name || room.type} (${room.id}) is landlocked without direct exterior ventilation or plumbing drop access.`);
        } else {
          warnings.push(`LANDLOCKED_HABITABLE: ${room.name || room.type} (${room.id}) has no exterior wall exposure for natural sunlight and ventilation.`);
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
