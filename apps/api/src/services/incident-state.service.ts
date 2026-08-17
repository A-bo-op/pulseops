import { prisma } from '../config/prisma.js';
import { reachedFailureThreshold } from './incident-rules.js';

export async function updateIncidentState(
  monitorId: string,
  result: { isUp: boolean; failureReason: string | null; checkedAt: Date },
) {
  if (result.isUp) {
    await prisma.incident.updateMany({
      where: { monitorId, status: 'OPEN' },
      data: { status: 'RESOLVED', resolvedAt: result.checkedAt, activeKey: null },
    });
    return;
  }

  const recentResults = await prisma.checkResult.findMany({
    where: { monitorId },
    orderBy: { checkedAt: 'desc' },
    take: 3,
    select: { isUp: true },
  });

  if (!reachedFailureThreshold(recentResults)) return;

  await prisma.incident.upsert({
    where: { activeKey: monitorId },
    create: {
      monitorId,
      activeKey: monitorId,
      status: 'OPEN',
      failureReason: result.failureReason ?? 'Three consecutive checks failed',
      startedAt: result.checkedAt,
    },
    update: {},
  });
}
