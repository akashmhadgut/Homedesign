import { Polygon } from '../../core/math';

export interface Setbacks {
  front: number;
  rear: number;
  left: number;
  right: number;
}

export interface Plot {
  id: string;
  projectId: string;
  // Guaranteed to be orthogonal polygons per MVP decisions
  boundary: Polygon;
  area: number; // Area in square mm
  frontage: number;
  depth: number;
  setbacks: Setbacks;
  // The buildable region is derived deterministically from the boundary and setbacks
  buildableBoundary?: Polygon;
}
