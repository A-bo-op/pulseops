import type { RequestHandler } from 'express';
import { incidentService } from '../services/incident.service.js';
import { getParam, requireUser } from '../utils/request.js';

export const listAllIncidents: RequestHandler = async (req, res) => {
  res.json(await incidentService.listAll(requireUser(req).id));
};
export const listProjectIncidents: RequestHandler = async (req, res) => {
  res.json(
    await incidentService.listForProject(requireUser(req).id, getParam(req, 'projectId')),
  );
};
export const getIncident: RequestHandler = async (req, res) => {
  res.json(await incidentService.get(requireUser(req).id, getParam(req, 'incidentId')));
};
