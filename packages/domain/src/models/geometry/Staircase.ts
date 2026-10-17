import { BoundingBox } from '../../core/math';

export type StaircaseConfiguration = 'STRAIGHT' | 'L_SHAPE' | 'U_SHAPE' | 'SPIRAL';

export interface Staircase {
  id: string;
  floorId: string;
  connectsToFloorId?: string; // Optional if it just goes to roof or not yet defined
  footprint: BoundingBox;
  width: number;
  configuration: StaircaseConfiguration;
  riserCount?: number;
}
