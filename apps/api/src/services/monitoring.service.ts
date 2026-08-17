import type { Monitor } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { executeHttpCheck } from './http-check.service.js';
import { updateIncidentState } from './incident-state.service.js';

export async function performMonitorCheck(monitor: Monitor, scheduled = false) {
  const outcome = await executeHttpCheck(monitor);

  await prisma.$transaction(async (tx) => {
    await tx.checkResult.create({ data: { monitorId: monitor.id, ...outcome } });
    await tx.monitor.update({
      where: { id: monitor.id },
      data: {
        lastCheckedAt: outcome.checkedAt,
        ...(scheduled
          ? {
              nextCheckAt: new Date(outcome.checkedAt.getTime() + monitor.intervalSeconds * 1000),
              leaseExpiresAt: null,
              leaseOwner: null,
            }
          : {}),
      },
    });
  });

  await updateIncidentState(monitor.id, {
    isUp: outcome.isUp,
    failureReason: outcome.errorMessage,
    checkedAt: outcome.checkedAt,
  });

  return outcome;
}
