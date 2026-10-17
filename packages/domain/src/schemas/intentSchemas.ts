import { z } from 'zod';

export const HardConstraintSchema = z.object({
  type: z.string(),
  targetId: z.string().optional(),
  rules: z.record(z.any()),
});

export const SoftPreferenceSchema = z.object({
  type: z.string(),
  targetId: z.string().optional(),
  weight: z.number(),
  rules: z.record(z.any()),
});

export const DesignIntentSchema = z.object({
  schemaVersion: z.number(),
  projectId: z.string().uuid(),
  floorsRequested: z.number().positive(),
  rooms: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.string(),
      minArea: z.number().positive().optional(),
    }),
  ),
  hardConstraints: z.array(HardConstraintSchema),
  softPreferences: z.array(SoftPreferenceSchema),
  unresolvedQuestions: z.array(z.string()),
  sourceRequirementIds: z.array(z.string().uuid()),
});
