import type { RequestHandler } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { requireUser } from '../utils/request.js';

export const getDashboard: RequestHandler = async (req, res) => {
  res.json(await dashboardService.get(requireUser(req).id));
};
