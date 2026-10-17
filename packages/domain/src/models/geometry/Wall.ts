import { Point } from '../../core/math';

export type WallRole = 'EXTERNAL' | 'INTERNAL' | 'BOUNDARY';

export interface Wall {
  id: string;
  floorId: string;
  startPoint: Point;
  endPoint: Point;
  thickness: number;
  role: WallRole;
  connectedWallIds: string[];
}
