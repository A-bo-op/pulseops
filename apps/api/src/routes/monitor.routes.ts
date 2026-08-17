import { Router } from 'express';
import {
  checkMonitor,
  deleteMonitor,
  getMonitor,
  monitorResults,
  monitorSummary,
  pauseMonitor,
  resumeMonitor,
  updateMonitor,
} from '../controllers/monitor.controller.js';
import { validateBody } from '../middleware/validate.js';
import { updateMonitorSchema } from '../validators/monitor.validator.js';

export const monitorRouter = Router();

monitorRouter
  .route('/:monitorId')
  .get(getMonitor)
  .patch(validateBody(updateMonitorSchema), updateMonitor)
  .delete(deleteMonitor);
monitorRouter.post('/:monitorId/pause', pauseMonitor);
monitorRouter.post('/:monitorId/resume', resumeMonitor);
monitorRouter.post('/:monitorId/check', checkMonitor);
monitorRouter.get('/:monitorId/results', monitorResults);
monitorRouter.get('/:monitorId/summary', monitorSummary);
