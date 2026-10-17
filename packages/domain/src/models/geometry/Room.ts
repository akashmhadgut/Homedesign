import type { Polygon } from '../../core/math';

export type RoomType =
  | 'LIVING'
  | 'BEDROOM'
  | 'KITCHEN'
  | 'BATHROOM'
  | 'CORRIDOR'
  | 'DINING'
  | 'LivingRoom'
  | 'Bedroom'
  | 'Kitchen'
  | 'Bathroom'
  | 'DiningRoom'
  | 'Pooja'
  | 'Study'
  | 'Balcony'
  | 'Gym'
  | 'Utility'
  | 'OTHER';

export interface Room {
  id: string;
  floorId: string;
  type: RoomType;
  name: string;
  // Bounding walls that define this room's derived polygon
  boundaryWallIds: string[];
  // The dynamically derived geometry representing the room's shape
  derivedPolygon?: Polygon;
  area: number; // Derived area in square mm
  minDimensions?: { width: number; length: number };
  tags: string[];
}
