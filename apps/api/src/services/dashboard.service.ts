import { prisma } from '../config/prisma.js';

export const dashboardService = {
  async get(userId: string) {
    const monitors = await prisma.monitor.findMany({
      where: { project: { userId } },
      select: {
        id: true,
        name: true,
        url: true,
        isActive: true,
        project: { select: { id: true, name: true } },
        checkResults: { orderBy: { checkedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const monitorIds = monitors.map(({ id }) => id);
    const [openIncidents, recentIncidents, recentChecks, responseTime] = await Promise.all([
      prisma.incident.count({ where: { status: 'OPEN', monitorId: { in: monitorIds } } }),
      prisma.incident.findMany({
        where: { monitorId: { in: monitorIds } },
        include: { monitor: { select: { id: true, name: true } } },
        orderBy: { startedAt: 'desc' },
        take: 5,
      }),
      prisma.checkResult.findMany({
        where: { monitorId: { in: monitorIds } },
        include: { monitor: { select: { id: true, name: true } } },
        orderBy: { checkedAt: 'desc' },
        take: 8,
      }),
      prisma.checkResult.aggregate({
        where: { monitorId: { in: monitorIds } },
        _avg: { responseTimeMs: true },
      }),
    ]);

    const up = monitors.filter(({ checkResults }) => checkResults[0]?.isUp).length;
    const down = monitors.filter(({ checkResults }) => checkResults[0] && !checkResults[0].isUp).length;

    return {
      metrics: {
        totalMonitors: monitors.length,
        monitorsUp: up,
        monitorsDown: down,
        pendingMonitors: monitors.length - up - down,
        openIncidents,
        averageResponseTimeMs: Math.round(responseTime._avg.responseTimeMs ?? 0),
      },
      monitors,
      recentIncidents,
      recentChecks,
    };
  },
};
