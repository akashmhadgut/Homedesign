import { HouseDesign, doPolygonsIntersect, isPolygonContained } from '@aihome/domain';
import { CompiledConstraintSet, ValidationResult } from '../core/types';
import { VentilationChecker } from '../checkers/VentilationChecker';
import { DimensionProportionChecker } from '../checkers/DimensionProportionChecker';
import { AdjacencyChecker } from '../checkers/AdjacencyChecker';
import { CirculationPrivacyChecker } from '../checkers/CirculationPrivacyChecker';

export class Validator {
  public static validateDesign(
    design: HouseDesign,
    context: CompiledConstraintSet,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check all required rooms exist
    const roomIds = new Set(design.rooms.map((r) => r.id));
    for (const req of context.requiredRooms) {
      if (!roomIds.has(req.id)) {
        errors.push(`REQUIRED_ROOM_MISSING: Missing room ${req.id} of type ${req.type}`);
      }
    }

    // 2. Check room areas against minimums (with 10% architectural planning tolerance)
    for (const room of design.rooms) {
      const req = context.requiredRooms.find((r) => r.id === room.id);
      if (req && room.area < req.minArea * 0.90) {
        errors.push(
          `ROOM_TOO_SMALL: Room ${room.id} area ${room.area} is less than required ${req.minArea}`,
        );
      }
    }

    // 3. Room overlap detection (strict zero-overlap rule)
    for (let i = 0; i < design.rooms.length; i++) {
      const roomA = design.rooms[i];
      if (!roomA.derivedPolygon) continue;
      
      for (let j = i + 1; j < design.rooms.length; j++) {
        const roomB = design.rooms[j];
        if (!roomB.derivedPolygon) continue;
        
        if (doPolygonsIntersect(roomA.derivedPolygon, roomB.derivedPolygon)) {
          errors.push(`ROOM_OVERLAP: Room ${roomA.id} overlaps with Room ${roomB.id}`);
        }
      }
    }

    // 4. Plot boundary containment
    if (context.buildableRegion && context.buildableRegion.vertices.length > 0) {
      for (const room of design.rooms) {
        if (room.derivedPolygon && !isPolygonContained(context.buildableRegion, room.derivedPolygon)) {
          errors.push(`OUTSIDE_BUILDABLE_AREA: Room ${room.id} is outside the buildable region`);
        }
      }
    }

    // 5. Architectural Quality Checkers (Ventilation, Proportions, Adjacency, Circulation)
    const ventCheck = VentilationChecker.check(design);
    errors.push(...ventCheck.errors);
    warnings.push(...ventCheck.warnings);

    const dimCheck = DimensionProportionChecker.check(design);
    errors.push(...dimCheck.errors);
    warnings.push(...dimCheck.warnings);

    const adjCheck = AdjacencyChecker.check(design);
    errors.push(...adjCheck.errors);
    warnings.push(...adjCheck.warnings);

    const circCheck = CirculationPrivacyChecker.check(design);
    errors.push(...circCheck.errors);
    warnings.push(...circCheck.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
