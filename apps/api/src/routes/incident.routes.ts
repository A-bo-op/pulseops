import { Router } from 'express';
import { getIncident, listAllIncidents } from '../controllers/incident.controller.js';

export const incidentRouter = Router();

incidentRouter.get('/', listAllIncidents);
incidentRouter.get('/:incidentId', getIncident);
