import { prisma } from '../config/prisma.js';

export const monitoringRepository = {
  createResult(data: {
    monitorId: string;
    statusCode: number | null;
    responseTimeMs: number;
    isUp: boolean;
    errorType: string | null;
    errorMessage: string | null;
    checkedAt: Date;
  }) {
    return prisma.checkResult.create({ data });
  },

  recentResults(monitorId: string, take: number) {
    return prisma.checkResult.findMany({
      where: { monitorId },
      orderBy: { checkedAt: 'desc' },
      take,
    });
  },

  resultsPage(monitorId: string, page: number, limit: number) {
    return prisma.$transaction([
      prisma.checkResult.findMany({
        where: { monitorId },
        orderBy: { checkedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.checkResult.count({ where: { monitorId } }),
    ]);
  },

  aggregateSummary(monitorId: string) {
    return prisma.checkResult.aggregate({
      where: { monitorId },
      _count: { _all: true, isUp: true },
      _avg: { responseTimeMs: true },
    });
  },
};
