import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/project.controller.js';
import { listProjectIncidents } from '../controllers/incident.controller.js';
import { createMonitor, listMonitors } from '../controllers/monitor.controller.js';
import { validateBody } from '../middleware/validate.js';
import { createMonitorSchema } from '../validators/monitor.validator.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

export const projectRouter = Router();

projectRouter.route('/').get(listProjects).post(validateBody(createProjectSchema), createProject);
projectRouter
  .route('/:projectId')
  .get(getProject)
  .patch(validateBody(updateProjectSchema), updateProject)
  .delete(deleteProject);
projectRouter
  .route('/:projectId/monitors')
  .get(listMonitors)
  .post(validateBody(createMonitorSchema), createMonitor);
projectRouter.get('/:projectId/incidents', listProjectIncidents);
