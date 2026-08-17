import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  MONITOR_SCHEDULER_INTERVAL_MS: z.coerce.number().int().min(1000).default(10_000),
  DEFAULT_MONITOR_TIMEOUT_MS: z.coerce.number().int().min(500).max(30_000).default(5_000),
  MONITOR_LEASE_DURATION_MS: z.coerce.number().int().min(10_000).default(45_000),
  LOG_LEVEL: z.string().default('info'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const message = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${message}`);
}

export const env = result.data;
