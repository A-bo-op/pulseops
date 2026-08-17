import type { HttpMethod } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { monitorRepository } from '../repositories/monitor.repository.js';
import { monitoringRepository } from '../repositories/monitoring.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { notFound } from '../utils/app-error.js';
import type {
  CreateMonitorInput,
  UpdateMonitorInput,
} from '../validators/monitor.validator.js';
import { assertSafeUrl } from './url-safety.service.js';
import { performMonitorCheck } from './monitoring.service.js';
import { calculateUptimePercentage } from './metrics.service.js';

async function requireOwnedMonitor(userId: string, monitorId: string) {
  const monitor = await monitorRepository.findOwnedBasic(userId, monitorId);
  if (!monitor) throw notFound('MONITOR_NOT_FOUND', 'Monitor not found');
  return monitor;
}

export const monitorService = {
  async list(userId: string, projectId: string) {
    if (!(await projectRepository.findOwnedBasic(userId, projectId))) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found');
    }
    return monitorRepository.listForOwnedProject(projectId, userId);
  },

  async create(userId: string, projectId: string, input: CreateMonitorInput) {
    if (!(await projectRepository.findOwnedBasic(userId, projectId))) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found');
    }
    await assertSafeUrl(input.url);
    return monitorRepository.create(projectId, {
      ...input,
      httpMethod: input.httpMethod as HttpMethod,
    });
  },

  async get(userId: string, monitorId: string) {
    const monitor = await monitorRepository.findOwned(userId, monitorId);
    if (!monitor) throw notFound('MONITOR_NOT_FOUND', 'Monitor not found');
    return monitor;
  },

  async update(userId: string, monitorId: string, input: UpdateMonitorInput) {
    await requireOwnedMonitor(userId, monitorId);
    if (input.url) await assertSafeUrl(input.url);
    return monitorRepository.update(monitorId, {
      ...input,
      httpMethod: input.httpMethod as HttpMethod | undefined,
      ...(input.isActive ? { nextCheckAt: new Date() } : {}),
    });
  },

  async delete(userId: string, monitorId: string) {
    await requireOwnedMonitor(userId, monitorId);
    await monitorRepository.delete(monitorId);
  },

  async setActive(userId: string, monitorId: string, active: boolean) {
    await requireOwnedMonitor(userId, monitorId);
    return monitorRepository.update(monitorId, {
      isActive: active,
      ...(active ? { nextCheckAt: new Date() } : {}),
    });
  },

  async checkNow(userId: string, monitorId: string) {
    const monitor = await requireOwnedMonitor(userId, monitorId);
    return performMonitorCheck(monitor);
  },

  async results(userId: string, monitorId: string, page: number, limit: number) {
    await requireOwnedMonitor(userId, monitorId);
    const [items, total] = await monitoringRepository.resultsPage(monitorId, page, limit);
    return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  async summary(userId: string, monitorId: string) {
    const monitor = await requireOwnedMonitor(userId, monitorId);
    const [latest] = await monitoringRepository.recentResults(monitorId, 1);
    const totals = await monitoringRepository.aggregateSummary(monitorId);
    const upCount = await prisma.checkResult.count({ where: { monitorId, isUp: true } });
    const total = totals._count._all;

    return {
      monitorId,
      currentStatus: latest ? (latest.isUp ? 'UP' : 'DOWN') : 'PENDING',
      responseTimeMs: latest?.responseTimeMs ?? null,
      uptimePercentage: calculateUptimePercentage(total, upCount),
      averageResponseTimeMs: Math.round(totals._avg.responseTimeMs ?? 0),
      lastCheckedAt: monitor.lastCheckedAt,
      totalChecks: total,
    };
  },
};
