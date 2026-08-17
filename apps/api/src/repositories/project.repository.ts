import { prisma } from '../config/prisma.js';

const projectWithHealth = {
  monitors: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      checkResults: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
      incidents: { where: { status: 'OPEN' as const }, select: { id: true } },
    },
  },
} as const;

export const projectRepository = {
  listByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      include: projectWithHealth,
      orderBy: { createdAt: 'desc' },
    });
  },

  findOwned(userId: string, id: string) {
    return prisma.project.findFirst({ where: { id, userId }, include: projectWithHealth });
  },

  findOwnedBasic(userId: string, id: string) {
    return prisma.project.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: { name: string; description?: string | null }) {
    return prisma.project.create({ data: { ...data, userId } });
  },

  update(id: string, data: { name?: string; description?: string | null }) {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
};
