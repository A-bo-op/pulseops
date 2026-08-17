import { projectRepository } from '../repositories/project.repository.js';
import { notFound } from '../utils/app-error.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../validators/project.validator.js';

function summarizeProject(project: Awaited<ReturnType<typeof projectRepository.findOwned>>) {
  if (!project) return null;
  const upCount = project.monitors.filter((monitor) => monitor.checkResults[0]?.isUp).length;
  const downCount = project.monitors.filter(
    (monitor) => monitor.checkResults[0] && !monitor.checkResults[0].isUp,
  ).length;

  return {
    ...project,
    monitorCount: project.monitors.length,
    upCount,
    downCount,
  };
}

export const projectService = {
  async list(userId: string) {
    const projects = await projectRepository.listByUser(userId);
    return projects.map((project) => summarizeProject(project));
  },

  async get(userId: string, projectId: string) {
    const project = await projectRepository.findOwned(userId, projectId);
    if (!project) throw notFound('PROJECT_NOT_FOUND', 'Project not found');
    return summarizeProject(project);
  },

  create(userId: string, input: CreateProjectInput) {
    return projectRepository.create(userId, input);
  },

  async update(userId: string, projectId: string, input: UpdateProjectInput) {
    if (!(await projectRepository.findOwnedBasic(userId, projectId))) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found');
    }
    return projectRepository.update(projectId, input);
  },

  async delete(userId: string, projectId: string) {
    if (!(await projectRepository.findOwnedBasic(userId, projectId))) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found');
    }
    await projectRepository.delete(projectId);
  },
};
