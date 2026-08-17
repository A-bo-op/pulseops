import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { performMonitorCheck } from '../services/monitoring.service.js';

const workerId = `${os.hostname()}-${process.pid}-${randomUUID().slice(0, 8)}`;
let timer: NodeJS.Timeout | null = null;
let running = false;

async function claimDueMonitors() {
  const now = new Date();
  const candidates = await prisma.monitor.findMany({
    where: {
      isActive: true,
      nextCheckAt: { lte: now },
      OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
    },
    orderBy: { nextCheckAt: 'asc' },
    take: 50,
  });

  const claimed = [];
  for (const monitor of candidates) {
    const result = await prisma.monitor.updateMany({
      where: {
        id: monitor.id,
        isActive: true,
        nextCheckAt: { lte: now },
        OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
      },
      data: {
        leaseOwner: workerId,
        leaseExpiresAt: new Date(now.getTime() + env.MONITOR_LEASE_DURATION_MS),
      },
    });
    if (result.count === 1) claimed.push(monitor);
  }

  return claimed;
}

export async function runSchedulerTick() {
  if (running) return;
  running = true;

  try {
    const monitors = await claimDueMonitors();
    await Promise.allSettled(
      monitors.map(async (monitor) => {
        try {
          await performMonitorCheck(monitor, true);
        } catch (error) {
          logger.error({ err: error, monitorId: monitor.id }, 'Scheduled monitor check failed');
          await prisma.monitor.updateMany({
            where: { id: monitor.id, leaseOwner: workerId },
            data: { leaseOwner: null, leaseExpiresAt: null },
          });
        }
      }),
    );
  } catch (error) {
    logger.error({ err: error }, 'Monitor scheduler tick failed');
  } finally {
    running = false;
  }
}

export function startMonitorScheduler() {
  if (timer) return;
  logger.info(
    { intervalMs: env.MONITOR_SCHEDULER_INTERVAL_MS, workerId },
    'Monitor scheduler started',
  );
  void runSchedulerTick();
  timer = setInterval(() => void runSchedulerTick(), env.MONITOR_SCHEDULER_INTERVAL_MS);
  timer.unref();
}

export function stopMonitorScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
