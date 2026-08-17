import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { startMonitorScheduler, stopMonitorScheduler } from './jobs/monitor-scheduler.js';

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'PulseOps API started');
  startMonitorScheduler();
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down PulseOps API');
  stopMonitorScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
