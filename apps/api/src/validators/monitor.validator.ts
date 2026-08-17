import { z } from 'zod';

const monitorUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'Only HTTP and HTTPS URLs are allowed',
  });

export const createMonitorSchema = z.object({
  name: z.string().trim().min(1).max(100),
  url: monitorUrl,
  httpMethod: z.enum(['GET', 'HEAD']).default('GET'),
  intervalSeconds: z.number().int().min(30).max(86_400).default(60),
  timeoutMs: z.number().int().min(500).max(30_000).default(5_000),
  expectedStatusCode: z.number().int().min(100).max(599).default(200),
});

export const updateMonitorSchema = createMonitorSchema
  .extend({ isActive: z.boolean().optional() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;
