import type { RequestHandler } from 'express';
import { monitorService } from '../services/monitor.service.js';
import { getParam, requireUser } from '../utils/request.js';

export const listMonitors: RequestHandler = async (req, res) => {
  res.json(await monitorService.list(requireUser(req).id, getParam(req, 'projectId')));
};
export const createMonitor: RequestHandler = async (req, res) => {
  res.status(201).json(
    await monitorService.create(requireUser(req).id, getParam(req, 'projectId'), req.body),
  );
};
export const getMonitor: RequestHandler = async (req, res) => {
  res.json(await monitorService.get(requireUser(req).id, getParam(req, 'monitorId')));
};
export const updateMonitor: RequestHandler = async (req, res) => {
  res.json(await monitorService.update(requireUser(req).id, getParam(req, 'monitorId'), req.body));
};
export const deleteMonitor: RequestHandler = async (req, res) => {
  await monitorService.delete(requireUser(req).id, getParam(req, 'monitorId'));
  res.status(204).send();
};
export const pauseMonitor: RequestHandler = async (req, res) => {
  res.json(await monitorService.setActive(requireUser(req).id, getParam(req, 'monitorId'), false));
};
export const resumeMonitor: RequestHandler = async (req, res) => {
  res.json(await monitorService.setActive(requireUser(req).id, getParam(req, 'monitorId'), true));
};
export const checkMonitor: RequestHandler = async (req, res) => {
  res.json(await monitorService.checkNow(requireUser(req).id, getParam(req, 'monitorId')));
};
export const monitorResults: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  res.json(await monitorService.results(requireUser(req).id, getParam(req, 'monitorId'), page, limit));
};
export const monitorSummary: RequestHandler = async (req, res) => {
  res.json(await monitorService.summary(requireUser(req).id, getParam(req, 'monitorId')));
};
