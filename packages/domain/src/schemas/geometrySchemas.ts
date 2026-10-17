import { z } from 'zod';

export const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const PolygonSchema = z.object({
  vertices: z.array(PointSchema).min(3),
});

export const BoundingBoxSchema = z.object({
  minX: z.number().finite(),
  minY: z.number().finite(),
  maxX: z.number().finite(),
  maxY: z.number().finite(),
});

export const WallSchema = z.object({
  id: z.string().uuid(),
  floorId: z.string().uuid(),
  startPoint: PointSchema,
  endPoint: PointSchema,
  thickness: z.number().positive(),
  role: z.enum(['EXTERNAL', 'INTERNAL', 'BOUNDARY']),
  connectedWallIds: z.array(z.string().uuid()),
});

export const RoomSchema = z.object({
  id: z.string().uuid(),
  floorId: z.string().uuid(),
  type: z.enum(['LIVING', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'CORRIDOR', 'DINING', 'OTHER']),
  name: z.string().min(1),
  boundaryWallIds: z.array(z.string().uuid()).min(3),
  derivedPolygon: PolygonSchema.optional(),
  area: z.number().nonnegative(),
  minDimensions: z
    .object({ width: z.number().positive(), length: z.number().positive() })
    .optional(),
  tags: z.array(z.string()),
});
