import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/api root or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const envSchema = z.object({
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be provided and strong for security').default(process.env.NODE_ENV === 'test' ? 'test-jwt-secret-minimum-10' : undefined as any),
  DATABASE_URL: z.string().default(process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/test' : undefined as any),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for AI features').default('dummy-key'),
  SHARE_LINK_SECRET: z.string().default('dummy-share-secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
}

export const env = (parsed.data || envSchema.parse({
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET || 'dummy-secret-minimum-10-chars',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/aihome'
})) as z.infer<typeof envSchema>;
