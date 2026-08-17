import type { HttpMethod } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const monitorDetailInclude = {
  project: { select: { id: true, name: true, userId: true } },
  checkResults: { orderBy: { checkedAt: 'desc' as const }, take: 20 },
  incidents: { orderBy: { startedAt: 'desc' as const }, take: 20 },
} as const;

export const monitorRepository = {
  listForOwnedProject(projectId: string, userId: string) {
    return prisma.monitor.findMany({
      where: { projectId, project: { userId } },
      include: {
        checkResults: { orderBy: { checkedAt: 'desc' }, take: 1 },
        incidents: { where: { status: 'OPEN' }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findOwned(userId: string, id: string) {
    return prisma.monitor.findFirst({
      where: { id, project: { userId } },
      include: monitorDetailInclude,
    });
  },

  findOwnedBasic(userId: string, id: string) {
    return prisma.monitor.findFirst({
      where: { id, project: { userId } },
      include: { project: { select: { userId: true } } },
    });
  },

  create(
    projectId: string,
    data: {
      name: string;
      url: string;
      httpMethod: HttpMethod;
      intervalSeconds: number;
      timeoutMs: number;
      expectedStatusCode: number;
    },
  ) {
    return prisma.monitor.create({ data: { ...data, projectId } });
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      url: string;
      httpMethod: HttpMethod;
      intervalSeconds: number;
      timeoutMs: number;
      expectedStatusCode: number;
      isActive: boolean;
      nextCheckAt: Date;
    }>,
  ) {
    return prisma.monitor.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.monitor.delete({ where: { id } });
  },
};
