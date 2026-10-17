import { HouseDesign } from '@aihome/domain';

export class CirculationPrivacyChecker {
  public static check(design: HouseDesign): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const doors = (design.doors || []) as any[];
    const rooms = design.rooms || [];

    // 1. External Front Entrance Door Check
    const externalDoors = doors.filter(d => d.type === 'EXTERNAL');
    if (externalDoors.length === 0) {
      errors.push('NO_EXTERNAL_ENTRANCE: Design has no main exterior entrance door.');
    }

    // 2. Toilet Door Sightline Privacy Check
    const living = rooms.find(r => (r.type as string).toUpperCase().includes('LIV') || (r.type as string).toUpperCase().includes('HALL'));
    const dining = rooms.find(r => (r.type as string).toUpperCase().includes('DIN'));
    const bathrooms = rooms.filter(r => (r.type as string).toUpperCase().includes('BATH') || (r.type as string).toUpperCase().includes('TOILET'));

    // Check if any bathroom door is located directly on a partition wall separating a bathroom from living/dining
    for (const bath of bathrooms) {
      if (!bath.derivedPolygon) continue;
      const bXs = bath.derivedPolygon.vertices.map((v: any) => v.x);
      const bYs = bath.derivedPolygon.vertices.map((v: any) => v.y);
      const bMinX = Math.min(...bXs);
      const bMaxX = Math.max(...bXs);
      const bMinY = Math.min(...bYs);
      const bMaxY = Math.max(...bYs);

      for (const door of doors) {
        if (!door._location) continue;
        const dx = door._location.x;
        const dy = door._location.y;

        // Check if door is on the perimeter of this bathroom
        const isDoorOnBathWall = 
          (Math.abs(dx - bMinX) < 150 || Math.abs(dx - bMaxX) < 150 || Math.abs(dy - bMinY) < 150 || Math.abs(dy - bMaxY) < 150) &&
          (dx >= bMinX - 150 && dx <= bMaxX + 150 && dy >= bMinY - 150 && dy <= bMaxY + 150);

        if (!isDoorOnBathWall) continue;

        // If door is on bath wall, check if that wall borders living or dining directly
        if (living?.derivedPolygon) {
          const lXs = living.derivedPolygon.vertices.map((v: any) => v.x);
          const lYs = living.derivedPolygon.vertices.map((v: any) => v.y);
          const lMinX = Math.min(...lXs);
          const lMaxX = Math.max(...lXs);
          const lMinY = Math.min(...lYs);
          const lMaxY = Math.max(...lYs);

          const touchesVerticalWall = (Math.abs(dx - lMinX) < 200 || Math.abs(dx - lMaxX) < 200) && (dy >= lMinY - 150 && dy <= lMaxY + 150);
          const touchesHorizontalWall = (Math.abs(dy - lMinY) < 200 || Math.abs(dy - lMaxY) < 200) && (dx >= lMinX - 150 && dx <= lMaxX + 150);

          if (touchesVerticalWall || touchesHorizontalWall) {
            warnings.push(`TOILET_DOOR_SIGHTLINE: ${bath.name || 'Bathroom'} door opens directly facing the Grand Living Lounge, compromising privacy.`);
          }
        }

        if (dining?.derivedPolygon) {
          const dXs = dining.derivedPolygon.vertices.map((v: any) => v.x);
          const dYs = dining.derivedPolygon.vertices.map((v: any) => v.y);
          const dMinX = Math.min(...dXs);
          const dMaxX = Math.max(...dXs);
          const dMinY = Math.min(...dYs);
          const dMaxY = Math.max(...dYs);

          const touchesVerticalWall = (Math.abs(dx - dMinX) < 200 || Math.abs(dx - dMaxX) < 200) && (dy >= dMinY - 150 && dy <= dMaxY + 150);
          const touchesHorizontalWall = (Math.abs(dy - dMinY) < 200 || Math.abs(dy - dMaxY) < 200) && (dx >= dMinX - 150 && dx <= dMaxX + 150);

          if (touchesVerticalWall || touchesHorizontalWall) {
            warnings.push(`TOILET_DOOR_SIGHTLINE: ${bath.name || 'Bathroom'} door opens directly facing the Formal Dining Hall, compromising dining privacy.`);
          }
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
