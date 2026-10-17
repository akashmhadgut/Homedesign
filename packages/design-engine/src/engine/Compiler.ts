import { DesignIntent, Plot } from '@aihome/domain';
import { CompiledConstraintSet, FeasibilityResult } from '../core/types';

export class Compiler {
  public static compile(intent: DesignIntent, plot: Plot): CompiledConstraintSet {
    // Basic MVP normalization: extract buildable region, ensure min areas exist
    const buildableRegion = plot.buildableBoundary || plot.boundary;

    const requiredRooms = intent.rooms.map((r) => ({
      id: r.id,
      type: r.type,
      minArea: r.minArea || 9000000, // default 9 sq meters in sq mm
    }));

    return {
      plot,
      buildableRegion,
      requiredRooms,
      hardConstraints: intent.hardConstraints || [],
      softPreferences: intent.softPreferences || [],
    };
  }

  public static checkFeasibility(compiledSet: CompiledConstraintSet): FeasibilityResult {
    const totalRequiredArea = compiledSet.requiredRooms.reduce((sum, r) => sum + r.minArea, 0);

    // Check if required area exceeds the absolute plot area
    if (totalRequiredArea > compiledSet.plot.area) {
      return {
        feasible: false,
        code: 'ROOM_MINIMUMS_EXCEED_CAPACITY',
        reason: `Required room area (${totalRequiredArea}) exceeds total plot area (${compiledSet.plot.area})`,
      };
    }

    return { feasible: true };
  }
}
