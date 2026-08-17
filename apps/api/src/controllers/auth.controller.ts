import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { requireUser } from '../utils/request.js';

export const register: RequestHandler = async (req, res) => {
  res.status(201).json(await authService.register(req.body));
};

export const login: RequestHandler = async (req, res) => {
  res.json(await authService.login(req.body));
};

export const me: RequestHandler = async (req, res) => {
  res.json(await authService.me(requireUser(req).id));
};
