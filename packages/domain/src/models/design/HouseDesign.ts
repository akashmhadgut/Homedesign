import { Plot } from './Plot';
import { Room } from '../geometry/Room';
import { Wall } from '../geometry/Wall';
import { Door, Window } from '../geometry/Opening';
import { Staircase } from '../geometry/Staircase';
import { Point } from '../../core/math';

export interface Floor {
  id: string;
  index: number;
  name: string;
  elevation: number; // Elevation from ground level in mm
  height: number; // Floor to ceiling height in mm
}

export interface Furniture {
  id: string;
  floorId: string;
  category: string;
  position: Point;
  rotation: number; // degrees
  width: number;
  depth: number;
  height: number;
}

export interface Dimension {
  id: string;
  floorId: string;
  startReference: string; // ID of start object (e.g., WallId)
  endReference: string; // ID of end object
  value: number;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  label: string;
}

export interface Orientation {
  northAngle: number; // degrees
  referenceType: 'PROJECT' | 'TRUE_NORTH';
}

/**
 * HouseDesign is the Canonical Aggregate Root for all geometric design state.
 */
export interface HouseDesign {
  schemaVersion: number;
  id: string;
  projectId: string;
  revision: number;
  units: 'mm';

  plotReference: Plot;
  orientation?: Orientation;

  floors: Floor[];
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  staircases: Staircase[];
  furniture: Furniture[];
  dimensions: Dimension[];

  // Untyped explicitly for MVP phase 1 skeleton, these will be typed in DesignIntent
  constraints: any[];
  preferences: any[];
}
