import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authRouter } from './auth.routes.js';
import { incidentRouter } from './incident.routes.js';
import { monitorRouter } from './monitor.routes.js';
import { projectRouter } from './project.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use(authenticate);
apiRouter.get('/dashboard', getDashboard);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/monitors', monitorRouter);
apiRouter.use('/incidents', incidentRouter);
