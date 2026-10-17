export const EPSILON = 1; // 1mm canonical tolerance

export interface Point {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Polygon {
  vertices: Point[];
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function pointsEqual(p1: Point, p2: Point, tolerance = EPSILON): boolean {
  return distance(p1, p2) <= tolerance;
}

export function getPolygonBoundingBox(polygon: Polygon): BoundingBox {
  if (polygon.vertices.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = polygon.vertices[0].x;
  let minY = polygon.vertices[0].y;
  let maxX = polygon.vertices[0].x;
  let maxY = polygon.vertices[0].y;
  for (const p of polygon.vertices) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export function doBoundingBoxesIntersect(b1: BoundingBox, b2: BoundingBox): boolean {
  return !(b1.maxX <= b2.minX || b1.minX >= b2.maxX || b1.maxY <= b2.minY || b1.minY >= b2.maxY);
}

// Ray casting algorithm for point in polygon
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
  let isInside = false;
  const vertices = polygon.vertices;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

// Simple polygon intersection (for orthogonal concepts mainly)
export function doPolygonsIntersect(poly1: Polygon, poly2: Polygon): boolean {
  if (poly1.vertices.length < 3 || poly2.vertices.length < 3) return false;
  
  const bb1 = getPolygonBoundingBox(poly1);
  const bb2 = getPolygonBoundingBox(poly2);
  
  if (!doBoundingBoxesIntersect(bb1, bb2)) return false;
  
  // If bounding boxes intersect, check if any vertex of poly1 is in poly2
  for (const pt of poly1.vertices) {
    if (isPointInPolygon(pt, poly2)) return true;
  }
  // Check if any vertex of poly2 is in poly1
  for (const pt of poly2.vertices) {
    if (isPointInPolygon(pt, poly1)) return true;
  }
  
  // Edge intersection check is needed for full robustness but this handles most cases for MVP
  // where rooms are basic rectangles that don't cross in 'plus' shapes without vertices overlapping
  return false;
}

export function isPolygonContained(container: Polygon, contained: Polygon): boolean {
  if (container.vertices.length < 3 || contained.vertices.length < 3) return false;
  
  // All vertices of the contained polygon must be inside the container
  for (const pt of contained.vertices) {
    if (!isPointInPolygon(pt, container)) {
      return false;
    }
  }
  return true;
}
