import { HouseDesign, Room } from '@aihome/domain';
import { CompiledConstraintSet, PreferenceEvaluation } from '../core/types';
import { getPolygonBoundingBox } from '@aihome/domain/src/core/math';

export class Analyzer {
  public static analyzeDesign(
    design: HouseDesign,
    context: CompiledConstraintSet,
  ): PreferenceEvaluation[] {
    const evaluations: PreferenceEvaluation[] = [];

    // Process soft preferences
    for (const pref of context.softPreferences) {
      if (pref.type === 'VASTU') {
        const vastuEvals = this.evaluateVastu(design);
        evaluations.push(...vastuEvals);
      } else {
        evaluations.push({
          preferenceId: pref.type,
          status: 'NOT_APPLICABLE',
          evidence: ['Preference type not supported by engine yet'],
        });
      }
    }

    return evaluations;
  }

  private static evaluateVastu(design: HouseDesign): PreferenceEvaluation[] {
    const evals: PreferenceEvaluation[] = [];
    const plotRef = design.plotReference;
    
    if (typeof plotRef === 'string' || !plotRef?.boundary) {
      return [{
        preferenceId: 'VASTU',
        status: 'NOT_APPLICABLE',
        evidence: ['Plot boundary missing, cannot evaluate geometric Vastu rules']
      }];
    }

    const plotBox = getPolygonBoundingBox(plotRef.boundary);
    const plotCenterX = plotBox.minX + (plotBox.maxX - plotBox.minX) / 2;
    const plotCenterY = plotBox.minY + (plotBox.maxY - plotBox.minY) / 2;

    const kitchen = design.rooms.find(r => r.type.toLowerCase() === 'kitchen');
    if (kitchen && kitchen.derivedPolygon) {
      const kBox = getPolygonBoundingBox(kitchen.derivedPolygon);
      const kCenterX = kBox.minX + (kBox.maxX - kBox.minX) / 2;
      const kCenterY = kBox.minY + (kBox.maxY - kBox.minY) / 2;

      // Simple Vastu rule: Kitchen should be in South-East
      // Assuming North is -Y and East is +X
      // South-East means +X (East) and +Y (South) relative to plot center
      if (kCenterX > plotCenterX && kCenterY > plotCenterY) {
        evals.push({
          preferenceId: 'VASTU_KITCHEN_SE',
          status: 'SATISFIED',
          evidence: ['Kitchen is correctly located in the South-East quadrant']
        });
      } else {
        evals.push({
          preferenceId: 'VASTU_KITCHEN_SE',
          status: 'UNSATISFIED',
          evidence: ['Kitchen is NOT in the South-East quadrant']
        });
      }
    }

    return evals;
  }
}
