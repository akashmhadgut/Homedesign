export type OpeningType = 'DOOR' | 'WINDOW';
export type DoorSwing = 'IN_LEFT' | 'IN_RIGHT' | 'OUT_LEFT' | 'OUT_RIGHT' | 'SLIDING' | 'OPEN';

export interface Opening {
  id: string;
  floorId: string;
  wallId: string;
  type: OpeningType;
  positionAlongWall: number; // Center position in mm from startPoint of host wall
  width: number;
  height: number;
}

export interface Door extends Opening {
  type: 'DOOR';
  swing: DoorSwing;
}

export interface Window extends Opening {
  type: 'WINDOW';
  sillHeight: number;
}
