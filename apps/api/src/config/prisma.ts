import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

prisma.$on('error', (event) => logger.error({ event }, 'Prisma error'));
prisma.$on('warn', (event) => logger.warn({ event }, 'Prisma warning'));
