import { z } from 'zod';
import { PolygonSchema } from './geometrySchemas';

export const SetbacksSchema = z.object({
  front: z.number().nonnegative(),
  rear: z.number().nonnegative(),
  left: z.number().nonnegative(),
  right: z.number().nonnegative(),
});

export const PlotSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  boundary: PolygonSchema,
  area: z.number().positive(),
  frontage: z.number().positive(),
  depth: z.number().positive(),
  setbacks: SetbacksSchema,
  buildableBoundary: PolygonSchema.optional(),
});
