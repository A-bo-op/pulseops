import type { RequestHandler } from 'express';
import { projectService } from '../services/project.service.js';
import { getParam, requireUser } from '../utils/request.js';

export const listProjects: RequestHandler = async (req, res) => {
  res.json(await projectService.list(requireUser(req).id));
};
export const createProject: RequestHandler = async (req, res) => {
  res.status(201).json(await projectService.create(requireUser(req).id, req.body));
};
export const getProject: RequestHandler = async (req, res) => {
  res.json(await projectService.get(requireUser(req).id, getParam(req, 'projectId')));
};
export const updateProject: RequestHandler = async (req, res) => {
  res.json(await projectService.update(requireUser(req).id, getParam(req, 'projectId'), req.body));
};
export const deleteProject: RequestHandler = async (req, res) => {
  await projectService.delete(requireUser(req).id, getParam(req, 'projectId'));
  res.status(204).send();
};
