import { prisma } from '../config/prisma.js';
import { notFound } from '../utils/app-error.js';

export const incidentService = {
  async listForProject(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw notFound('PROJECT_NOT_FOUND', 'Project not found');

    return prisma.incident.findMany({
      where: { monitor: { projectId } },
      include: { monitor: { select: { id: true, name: true, url: true } } },
      orderBy: { startedAt: 'desc' },
    });
  },

  async listAll(userId: string) {
    return prisma.incident.findMany({
      where: { monitor: { project: { userId } } },
      include: {
        monitor: {
          select: { id: true, name: true, url: true, project: { select: { id: true, name: true } } },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  },

  async get(userId: string, incidentId: string) {
    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, monitor: { project: { userId } } },
      include: {
        monitor: {
          include: {
            project: { select: { id: true, name: true } },
            checkResults: { orderBy: { checkedAt: 'desc' }, take: 20 },
          },
        },
      },
    });
    if (!incident) throw notFound('INCIDENT_NOT_FOUND', 'Incident not found');
    return incident;
  },
};
